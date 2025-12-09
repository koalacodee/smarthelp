"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MembershipService } from "@/lib/api/v2";
import type {
  AttachmentMetadata,
  GetAttachmentGroupResponse,
  AttachmentsChangeEvent,
} from "@/lib/api/v2/services/membership";
import FileHubSingleMediaView from "@/app/f/a/g/[key]/components/FileHubSingleMediaView";

type AuthState =
  | "checking"
  | "authenticated"
  | "needs_auth"
  | "waiting_for_otp";

export default function TVViewer() {
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [otp, setOtp] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAttachment, setCurrentAttachment] =
    useState<AttachmentMetadata | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to attachment changes
  const subscribeToChanges = useCallback((memberIdToSubscribe: string) => {
    // Unsubscribe from previous subscription if exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsubscribe = MembershipService.subscribeToAttachmentChanges(
      memberIdToSubscribe,
      (event: AttachmentsChangeEvent) => {
        console.log("Attachments updated:", event.attachments);
        setAttachments(event.attachments);
      }
    );

    unsubscribeRef.current = unsubscribe;
  }, []);

  // Handle successful authentication and attachment retrieval
  const handleAttachmentsReceived = useCallback(
    (response: GetAttachmentGroupResponse) => {
      console.log("Attachments received:", response);
      setAttachments(response.attachments);
      setMemberId(response.memberId);
      setAuthState("authenticated");
      setError(null);

      // Subscribe to real-time changes
      subscribeToChanges(response.memberId);
    },
    [subscribeToChanges]
  );

  // Try to get attachments (check if already authenticated)
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setAuthState("checking");
        const response = await MembershipService.getMyAttachmentGroup();
        handleAttachmentsReceived(response);
      } catch (err: any) {
        console.log("Not authenticated, starting OTP flow:", err);
        // Not authenticated, start OTP flow
        setAuthState("needs_auth");
        await startOtpFlow();
      }
    };

    checkAuthentication();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [handleAttachmentsReceived]);

  // Start OTP authentication flow
  const startOtpFlow = async () => {
    try {
      setAuthState("waiting_for_otp");
      setError(null);

      await MembershipService.authenticateAndGetAttachments(
        // onOtpGenerated callback
        async (generatedOtp: string) => {
          console.log("OTP generated:", generatedOtp);
          setOtp(generatedOtp);
        },
        // onAuthorizeAndGetMyAttachments callback
        async (response: GetAttachmentGroupResponse) => {
          handleAttachmentsReceived(response);
          setOtp(null); // Clear OTP display
        }
      );
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setError(err.message || "Authentication failed");
      setAuthState("needs_auth");
    }
  };

  // Update current attachment when index or attachments change
  useEffect(() => {
    if (attachments.length > 0) {
      setCurrentAttachment(attachments[currentIndex] || attachments[0]);
    }
  }, [currentIndex, attachments]);

  // Handle media ended - move to next attachment
  const handleEnded = useCallback(() => {
    if (attachments.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % attachments.length);
    }
  }, [attachments.length]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit fullscreen:", err);
      });
    }
  }, []);

  // Render loading state
  if (authState === "checking") {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Render OTP waiting state
  if (authState === "waiting_for_otp" && otp) {
    return (
      <div className="w-screen h-screen bg-[#0a1628] flex flex-col items-center justify-center p-8 relative">
        {/* SmartHelp Branding - Top Left */}
        <div className="absolute top-8 left-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-lg leading-tight">
              Smart<span className="text-[#0ea5e9]">Help</span>
            </div>
            <div className="text-gray-400 text-xs uppercase tracking-wider">
              Display System
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md w-full text-center">
          {/* Lock Icon */}
          <div className="mb-8">
            <svg
              className="w-16 h-16 mx-auto text-[#0ea5e9]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Connect Display
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-8 text-base leading-relaxed">
            Link this screen to the{" "}
            <span className="text-white font-medium">
              SmartHelp Content System
            </span>
            .
            <br />
            Enter this code on your dashboard to authorize content playback.
          </p>

          {/* OTP Card */}
          <div className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-2xl p-8 mb-6 relative overflow-hidden">
            {/* Refresh Icon - Top Right */}
            <div className="absolute top-4 right-4">
              <svg
                className="w-5 h-5 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>

            <p className="text-white/80 text-sm mb-3 uppercase tracking-widest font-medium">
              Display Pairing Code
            </p>
            <p className="text-6xl font-bold text-white tracking-[0.3em] font-mono">
              {otp}
            </p>
          </div>

          {/* Waiting Status */}
          <div className="flex items-center justify-center space-x-2 text-[#f59e0b]">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-base font-medium">
              Waiting for authorization...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render authenticated state with media viewer
  if (authState === "authenticated" && currentAttachment) {
    return (
      <div
        ref={containerRef}
        onClick={toggleFullscreen}
        className="w-screen h-screen bg-black cursor-pointer"
      >
        <FileHubSingleMediaView
          attachment={currentAttachment}
          onEnded={handleEnded}
        />
      </div>
    );
  }

  // Fallback - no attachments
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <p className="text-xl">No attachments available</p>
      </div>
    </div>
  );
}
