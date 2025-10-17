import { io, Socket } from "socket.io-client";
import { Attachment } from "../attachment-group";

export type AttachmentGroupUpdate = {
  groupKey: string;
  attachments: Attachment[];
  [key: string]: unknown;
};

export type AttachmentGroupCallback = (data: AttachmentGroupUpdate) => void;

export class AttachmentGroupSocketClient {
  private baseUrl: string;
  private socket: Socket | null;
  private listeners: Map<string, AttachmentGroupCallback[]>;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.socket = null;
    this.listeners = new Map<string, AttachmentGroupCallback[]>();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Connect to the Socket.IO server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(`${this.baseUrl}/attachment-groups`, {
          transports: ["websocket"],
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.socket.on("connect", () => {
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on("disconnect", () => {
          // Disconnected from attachment group gateway
        });

        this.socket.on("connect_error", (error) => {
          reject(error);
        });

        // Listen for update messages
        this.socket.on(
          "update",
          (message: { type: string; data: AttachmentGroupUpdate }) => {
            if (message.type === "update" && message.data) {
              const { groupKey } = message.data;
              const listeners = this.listeners.get(groupKey) || [];
              listeners.forEach((callback) => {
                try {
                  callback(message.data);
                } catch (err) {
                  // Error in listener callback
                }
              });
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to a specific group for updates
   */
  subscribeToGroup(
    groupKey: string,
    callback: AttachmentGroupCallback
  ): () => void {
    if (!this.socket || !this.socket.connected) {
      throw new Error("Socket.IO client is not connected");
    }

    // Send subscribe message to the gateway
    this.socket.emit(
      "message",
      JSON.stringify({ type: "subscribe", groupKey })
    );

    // Register listener
    if (!this.listeners.has(groupKey)) {
      this.listeners.set(groupKey, []);
    }
    this.listeners.get(groupKey)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(groupKey) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    };
  }

  /**
   * Disconnect manually
   */
  disconnect(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }
}
