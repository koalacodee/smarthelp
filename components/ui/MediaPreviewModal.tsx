"use client";
import React, { useState, useEffect } from "react";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import X from "@/icons/X";
import RefreshCw from "@/icons/RefreshCw";
import api from "@/lib/api";
import { usePathname } from "next/navigation";
import { env } from "next-runtime-env";
import { UploadService } from "@/lib/api/v2";

export default function MediaPreviewModal() {
  const baseUrl = api.client.defaults.baseURL;
  const { isOpen, mediaInfo, closePreview } = useMediaPreviewStore();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const loadMedia = async () => {
      if (isOpen && mediaInfo) {
        // Check if it's already a blob URL (for new attachments)
        if (mediaInfo.tokenOrId.startsWith("blob:")) {
          setMediaUrl(mediaInfo.tokenOrId);
        } else {
          // For existing attachments, construct the URL directly
          const mediaRetrievalType = env("NEXT_PUBLIC_MEDIA_ACCESS_TYPE");
          if (mediaRetrievalType === "signed-url") {
            const signedUrl = await UploadService.getAttachmentSignedUrl(
              mediaInfo.tokenOrId
            );
            setMediaUrl(signedUrl.signedUrl);
          } else {
            setMediaUrl(`${baseUrl}/attachment/${mediaInfo.tokenOrId}`);
          }
        }
        setError(null);
        setIsLoading(false);
      } else {
        // Reset state when modal closes
        setMediaUrl(null);
        setError(null);
        setIsLoading(false);
      }
    };
    loadMedia();
  }, [isOpen, mediaInfo, baseUrl]);

  useEffect(() => {
    closePreview();
  }, [pathname]);
  //     // Check if it's already a blob URL (for new attachments)
  //     if (mediaInfo.tokenOrId.startsWith("blob:")) {
  //       setMediaUrl(mediaInfo.tokenOrId);
  //       return;
  //     }

  //     const response = await fetch(
  //       `${baseUrl}/attachment/${mediaInfo.tokenOrId}`
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Failed to load media: ${response.statusText}`);
  //     }

  //     const blob = await response.blob();
  //     const url = URL.createObjectURL(blob);
  //     setMediaUrl(url);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to load media");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleClose = () => {
    closePreview();
  };

  const getFileType = (fileType?: string, originalName?: string) => {
    if (fileType) return fileType;
    if (originalName) {
      const extension = originalName.split(".").pop()?.toLowerCase();
      return extension || "unknown";
    }
    return "unknown";
  };

  const isImage = (fileType: string) => {
    return [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "bmp",
      "image",
    ].includes(fileType.toLowerCase());
  };

  const isVideo = (fileType: string) => {
    return ["mp4", "webm", "ogg", "avi", "mov", "wmv", "flv", "video"].includes(
      fileType.toLowerCase()
    );
  };

  const isAudio = (fileType: string) => {
    return ["mp3", "wav", "ogg", "aac", "flac", "m4a", "audio"].includes(
      fileType.toLowerCase()
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen || !mediaInfo) return null;

  const fileType = getFileType(mediaInfo.fileType, mediaInfo.originalName);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {mediaInfo.originalName}
            </h3>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
              <span className="capitalize">{fileType}</span>
              {mediaInfo.sizeInBytes && (
                <span>{formatFileSize(mediaInfo.sizeInBytes)}</span>
              )}
              {mediaInfo.expiryDate && (
                <span>
                  Expires: {new Date(mediaInfo.expiryDate).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              // onClick={loadMedia}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              aria-label="Refresh media"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">Loading media...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-2">
                  Failed to load media
                </p>
                <p className="text-slate-500 text-sm">{error}</p>
                <button
                  // onClick={loadMedia}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {mediaUrl && !isLoading && !error && (
            <div className="flex justify-center">
              {isImage(fileType) && (
                <img
                  src={mediaUrl}
                  alt={mediaInfo.originalName}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              )}

              {isVideo(fileType) && (
                <video
                  src={mediaUrl}
                  controls
                  className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {isAudio(fileType) && (
                <div className="w-full max-w-md">
                  <div className="bg-slate-50 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-700 font-medium mb-2">
                      {mediaInfo.originalName}
                    </p>
                    <audio
                      src={mediaUrl}
                      controls
                      className="w-full"
                      preload="metadata"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              {!isImage(fileType) &&
                !isVideo(fileType) &&
                !isAudio(fileType) && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-600 font-medium mb-2">
                      Preview not available
                    </p>
                    <p className="text-slate-500 text-sm mb-4">
                      This file type ({fileType}) cannot be previewed in the
                      browser.
                    </p>
                    <a
                      href={mediaUrl}
                      download={mediaInfo.originalName}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download File
                    </a>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
