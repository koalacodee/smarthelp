import { io, Socket } from "socket.io-client";
import ky, { type KyInstance } from "ky";
import { JSend } from "../models/jsend";

/**
 * Configuration options for the AttachmentGroupMemberSDK
 */
export interface AttachmentGroupMemberSDKConfig {
  /**
   * Base URL of the API server (e.g., 'https://api.example.com')
   */
  apiBaseUrl: string;

  /**
   * WebSocket server URL (e.g., 'https://api.example.com')
   * If not provided, will use apiBaseUrl
   */
  wsBaseUrl?: string;

  /**
   * Additional ky options for HTTP requests
   */
  httpOptions?: {
    timeout?: number;
    retry?: number;
    headers?: Record<string, string>;
  };
}

/**
 * Attachment metadata returned from the API
 */
export interface AttachmentMetadata {
  fileType: string;
  contentType: string;
  id: string;
  type: string;
  filename: string;
  originalName: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
  targetId?: string;
  userId?: string;
  guestId?: string;
  isGlobal: boolean;
  size: number;
  cloned: boolean;
  signedUrl: string;
}

/**
 * Attachment group metadata
 */
export interface AttachmentGroupMetadata {
  id: string;
  key: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

/**
 * Response from requesting membership
 */
export interface RequestMembershipResponse {
  otp: string;
}

/**
 * Response from verifying member OTP
 */
export interface VerifyMemberOtpResponse {
  success: boolean;
}

/**
 * Response from getting attachment group by member ID
 */
export interface GetAttachmentGroupResponse {
  attachmentGroup: AttachmentGroupMetadata;
  attachments: AttachmentMetadata[];
  memberId: string;
}

/**
 * Event emitted when attachments change
 */
export interface AttachmentsChangeEvent {
  attachments: AttachmentMetadata[];
}

/**
 * SDK for non-employee users to access attachment groups
 * Handles OTP-based authentication and WebSocket real-time updates
 */
export class AttachmentGroupMemberSDK {
  private readonly httpClient: KyInstance;
  private socket: Socket | null = null;
  private readonly wsBaseUrl: string;
  private currentMemberId: string | null = null;
  private currentAttachmentsChangeCallback:
    | ((event: AttachmentsChangeEvent) => void)
    | null = null;

  constructor(config: AttachmentGroupMemberSDKConfig) {
    this.wsBaseUrl = config.wsBaseUrl || config.apiBaseUrl;

    // Initialize ky HTTP client with credentials for cookie support
    this.httpClient = ky.create({
      prefixUrl: `${config.apiBaseUrl}/filehub/attachment-groups`,
      credentials: "include", // Important: enables cookie support
      timeout: config.httpOptions?.timeout || 30000,
      retry: config.httpOptions?.retry || 2,
      headers: {
        "Content-Type": "application/json",
        ...config.httpOptions?.headers,
      },
    });
  }

  /**
   * Request a membership OTP
   * This OTP should be shared with the attachment group creator
   *
   * @returns Promise with the generated OTP
   * @throws Error if request fails
   */
  async requestMembership(): Promise<string> {
    try {
      const response = await this.httpClient
        .post("membership/request", {
          headers: { "Content-Type": undefined },
        })
        .json<JSend<RequestMembershipResponse>>();
      return response.data.otp;
    } catch (error: any) {
      throw new Error(`Failed to request membership: ${error?.message}`);
    }
  }

  /**
   * Wait for authorization OTP via WebSocket
   * This method subscribes to the OTP and waits for the creator to authorize the member
   *
   * @param otp - The OTP obtained from requestMembership()
   * @param timeoutMs - Maximum time to wait in milliseconds (default: 25 minutes)
   * @returns Promise with the authorization OTP
   * @throws Error if timeout occurs or connection fails
   */
  async subscribeForAuthorization(
    otp: string,
    // timeoutMs: number = 25 * 60 * 1000
    onAuthorize: (otp: string) => void | Promise<void>
  ): Promise<void> {
    // Connect to WebSocket if not already connected
    if (!this.socket || !this.socket.connected) {
      this.socket = io(`${this.wsBaseUrl}/filehub/members`, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
    }

    const socket = this.socket;

    // Handle connection errors
    const onError = (error: Error) => {
      socket.off("member_authorize");
      socket.emit("otp_unsubscribe", { otp });
    };

    socket.once("connect_error", onError);
    socket.once("error", onError);

    // Wait for connection before subscribing
    const subscribeToOtp = async () => {
      socket.emit("otp_subscribe", { otp });

      // Listen for authorization event
      socket.once("member_authorize", async (data: { otp: string }) => {
        socket.off("connect_error", onError);
        socket.off("error", onError);
        socket.emit("otp_unsubscribe", { otp });
        await onAuthorize(data.otp);
      });
    };

    if (socket.connected) {
      await subscribeToOtp();
    } else {
      socket.once("connect", subscribeToOtp);
    }
  }

  /**
   * Verify the authorization OTP and obtain JWT access token
   * The token will be stored in an HTTP-only cookie automatically
   *
   * @param authorizeOtp - The authorization OTP received from waitForAuthorization()
   * @returns Promise with verification result
   * @throws Error if verification fails
   */
  async verifyMemberOtp(authorizeOtp: string): Promise<boolean> {
    try {
      const response = await this.httpClient
        .post("membership/verify", {
          json: { authorizeOtp },
        })
        .json<VerifyMemberOtpResponse>();

      return response.success;
    } catch (error: any) {
      throw new Error(`Failed to verify member OTP: ${error?.message}`);
    }
  }

  /**
   * Get attachment group and attachments for the authenticated member
   * Requires prior authentication via verifyMemberOtp()
   *
   * @returns Promise with attachment group and attachments with signed URLs
   * @throws Error if not authenticated or request fails
   */
  async getMyAttachmentGroup(): Promise<GetAttachmentGroupResponse> {
    try {
      const response = await this.httpClient
        .get("membership")
        .json<JSend<GetAttachmentGroupResponse>>();

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error(
          "Not authenticated. Please complete the authentication flow first."
        );
      }
      throw new Error(`Failed to get attachment group: ${error.message}`);
    }
  }

  /**
   * Subscribe to real-time attachment changes for the authenticated member
   *
   * @param memberId - The member ID (obtained from getMyAttachmentGroup)
   * @param onAttachmentsChange - Callback function when attachments change
   * @returns Unsubscribe function
   */
  subscribeToAttachmentChanges(
    memberId: string,
    onAttachmentsChange: (event: AttachmentsChangeEvent) => void
  ): () => void {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(`${this.wsBaseUrl}/filehub/members`, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
    }

    const socket = this.socket;
    this.currentMemberId = memberId;
    this.currentAttachmentsChangeCallback = onAttachmentsChange;

    const subscribe = () => {
      socket.emit("member_subscribe", { memberId });
      socket.on("attachments_change", onAttachmentsChange);
    };

    if (socket.connected) {
      subscribe();
    } else {
      socket.once("connect", subscribe);
    }

    // Return unsubscribe function
    return () => {
      socket.off("attachments_change", onAttachmentsChange);
      socket.emit("member_unsubscribe", { memberId });
      // Only clear state if this unsubscribe is for the current subscription
      // This prevents clearing state during connection renewal
      if (
        this.currentMemberId === memberId &&
        this.currentAttachmentsChangeCallback === onAttachmentsChange
      ) {
        this.currentMemberId = null;
        this.currentAttachmentsChangeCallback = null;
      }
    };
  }

  /**
   * Complete authentication flow in one call
   * This is a convenience method that combines all authentication steps
   *
   * @param onOtpGenerated - Callback to share the OTP with the attachment group creator
   * @param timeoutMs - Maximum time to wait for authorization (default: 25 minutes)
   * @returns Promise with attachment group data
   * @throws Error if any step fails
   */
  async authenticateAndGetAttachments(
    onOtpGenerated: (otp: string) => void | Promise<void>,
    onAuthorizeAndGetMyAttachments: (
      attachments: GetAttachmentGroupResponse
    ) => void | Promise<void>
  ): Promise<void> {
    // Step 1: Request membership OTP
    const otp = await this.requestMembership();

    // Step 2: Share OTP with creator
    await onOtpGenerated(otp);
    // Step 3: Wait for authorization
    await this.subscribeForAuthorization(otp, async (authorizeOtp) => {
      console.log("Authorization OTP received:", authorizeOtp);
      // Step 4: Verify and get JWT
      await this.verifyMemberOtp(authorizeOtp);
      const attachments = await this.getMyAttachmentGroup();
      await onAuthorizeAndGetMyAttachments(attachments);
    });
  }

  /**
   * Disconnect WebSocket connection
   * Call this when you're done using the SDK
   */
  disconnect(): void {
    if (this.socket) {
      if (this.currentMemberId) {
        this.socket.emit("member_unsubscribe", {
          memberId: this.currentMemberId,
        });
      }
      this.socket.disconnect();
      this.socket = null;
      this.currentMemberId = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Hard connection renewal - completely destroys and recreates the WebSocket connection
   * This will automatically resubscribe if there was an active subscription
   * @param onResubscribed - Optional callback with the new unsubscribe function
   */
  renewConnection(onResubscribed?: (unsubscribe: () => void) => void): void {
    console.log("[renewConnection] Starting hard connection renewal...");
    // Store current subscription info before disconnecting
    const memberId = this.currentMemberId;
    const callback = this.currentAttachmentsChangeCallback;

    console.log("[renewConnection] Current state:", {
      hasMemberId: !!memberId,
      hasCallback: !!callback,
      hasSocket: !!this.socket,
      isConnected: this.socket?.connected,
    });

    // Completely destroy the connection
    if (this.socket) {
      console.log("[renewConnection] Disconnecting socket...");
      // Unsubscribe before disconnecting
      if (this.currentMemberId) {
        this.socket.emit("member_unsubscribe", {
          memberId: this.currentMemberId,
        });
        console.log(
          "[renewConnection] Unsubscribed from member:",
          this.currentMemberId
        );
      }
      // Remove all listeners to ensure clean disconnect
      this.socket.removeAllListeners();
      // Disconnect the socket
      this.socket.disconnect();
      // Destroy the socket instance
      this.socket = null;
      console.log("[renewConnection] Socket disconnected and destroyed");
    }

    // Clear current state
    this.currentMemberId = null;
    this.currentAttachmentsChangeCallback = null;

    // Reconnect and resubscribe if there was an active subscription
    if (memberId && callback) {
      console.log("[renewConnection] Will resubscribe after 100ms delay...");
      // Use setTimeout to ensure the old connection is fully closed
      setTimeout(() => {
        console.log("[renewConnection] Resubscribing to member:", memberId);
        const unsubscribe = this.subscribeToAttachmentChanges(
          memberId,
          callback
        );
        console.log("[renewConnection] Resubscribed successfully");
        if (onResubscribed) {
          console.log("[renewConnection] Calling onResubscribed callback");
          onResubscribed(unsubscribe);
        }
      }, 100);
    } else {
      console.warn(
        "[renewConnection] No active subscription to resubscribe. memberId:",
        memberId,
        "callback:",
        !!callback
      );
      if (onResubscribed) {
        console.log(
          "[renewConnection] No resubscription, but calling onResubscribed with null"
        );
        // Still call the callback to update the ref, even if there's nothing to unsubscribe
        onResubscribed(() => {
          console.log("[renewConnection] Empty unsubscribe called");
        });
      }
    }
  }
}

// Export a factory function for easier usage
export function createAttachmentGroupMemberSDK(
  config: AttachmentGroupMemberSDKConfig
): AttachmentGroupMemberSDK {
  return new AttachmentGroupMemberSDK(config);
}
