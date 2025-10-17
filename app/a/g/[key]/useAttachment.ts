import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Attachment object structure
 */
import { Attachment } from "@/lib/api/v2/services/attachment-group";

/**
 * WebSocket message structure for updates
 */
interface UpdateMessage {
  type: "update";
  data: {
    attachments?: Attachment[];
    attachmentIds?: string[];
    groupKey?: string;
    updatedAt?: Date;
    [key: string]: any;
  };
}

/**
 * WebSocket message for subscription acknowledgment
 */
interface SubscribedMessage {
  groupKey: string;
  status: "success" | "error";
}

/**
 * Options for the useAttachmentGroup hook
 */
interface UseAttachmentGroupOptions {
  /** Whether to connect automatically (default: true) */
  autoConnect?: boolean;
  /** Number of reconnect attempts (default: 5) */
  reconnectAttempts?: number;
  /** Delay between reconnect attempts in ms (default: 1000) */
  reconnectDelay?: number;
}

/**
 * Return type for the useAttachmentGroup hook
 */
interface UseAttachmentGroupResult {
  /** List of attachments in the group */
  attachments: Attachment[];
  /** Whether the WebSocket is connected */
  isConnected: boolean;
  /** Whether the client is subscribed to the group */
  isSubscribed: boolean;
  /** Error message if any */
  error: string | null;
  /** Timestamp of the last update */
  lastUpdate: Date | null;
  /** Method to manually connect to the WebSocket server */
  connect: () => void;
  /** Method to manually disconnect from the WebSocket server */
  disconnect: () => void;
  /** Method to manually subscribe to a group */
  subscribe: (key: string) => void;
  /** Raw socket for advanced usage */
  socket: Socket | null;
}

/**
 * React hook for connecting to and managing attachment group WebSocket updates
 *
 * @param baseUrl - The base URL of the WebSocket server (e.g., 'http://localhost:8080')
 * @param groupKey - The key of the attachment group to subscribe to
 * @param options - Additional options
 * @returns Hook state and methods
 */
export function useAttachmentGroup(
  baseUrl: string,
  groupKey: string,
  options: UseAttachmentGroupOptions = {}
): UseAttachmentGroupResult {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000,
  } = options;

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectCountRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentGroupKeyRef = useRef<string>(groupKey);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      // Clean up any existing connection
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Connecting to WebSocket server

      // Create Socket.IO connection
      socketRef.current = io(`${baseUrl}/attachment-groups`, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: reconnectAttempts,
        reconnectionDelay: reconnectDelay,
      });

      // Connection opened
      socketRef.current.on("connect", () => {
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0;

        // Subscribe to the group if we have a groupKey
        if (currentGroupKeyRef.current) {
          subscribe(currentGroupKeyRef.current);
        }
      });

      // Connection error
      socketRef.current.on("connect_error", (err: Error) => {
        setError(`Connection error: ${err.message}`);
      });

      // Handle subscription acknowledgment
      socketRef.current.on("subscribed", (data: SubscribedMessage) => {
        if (data.groupKey === currentGroupKeyRef.current) {
          setIsSubscribed(true);
        }
      });

      // Handle errors
      socketRef.current.on("error", (err: { message?: string }) => {
        setError(`WebSocket error: ${err.message || "Unknown error"}`);
      });

      // Listen for updates
      socketRef.current.on("update", (message: UpdateMessage) => {
        try {
          // If we're not subscribed to any group, ignore updates
          if (!currentGroupKeyRef.current) {
            return;
          }

          if (message.type === "update" && message.data) {
            // Check if this update is for our group
            const updateGroupKey = message.data.groupKey;

            // If no specific group key in the message, or it matches our group
            if (
              !updateGroupKey ||
              updateGroupKey === currentGroupKeyRef.current
            ) {
              // If the message contains attachments, update our state
              if (message.data.attachments) {
                setAttachments(message.data.attachments);
                setLastUpdate(new Date());
              }
            }
          }
        } catch (err) {
          // Error processing update message
        }
      });

      // Connection closed
      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        setIsSubscribed(false);

        // Attempt to reconnect if not at max attempts
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;

          // Clear any existing timer
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
          }

          // Set a new timer
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectCountRef.current);
        }
      });
    } catch (err: any) {
      setError(`Error setting up WebSocket: ${err.message}`);
    }
  }, [baseUrl, reconnectAttempts, reconnectDelay]);

  // Subscribe to a group
  const subscribe = useCallback((key: string) => {
    if (!socketRef.current?.connected) {
      return;
    }

    try {
      socketRef.current.emit("subscribe", { groupKey: key });
      currentGroupKeyRef.current = key;
    } catch (err: any) {
      setError(`Error subscribing to group: ${err.message}`);
    }
  }, []);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsSubscribed(false);
  }, []);

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Update currentGroupKeyRef when groupKey changes
  useEffect(() => {
    currentGroupKeyRef.current = groupKey;
  }, [groupKey]);

  // Subscribe when groupKey changes and we're connected
  useEffect(() => {
    if (isConnected && groupKey) {
      subscribe(groupKey);
    }
  }, [isConnected, groupKey, subscribe]);

  return {
    // State
    attachments,
    isConnected,
    isSubscribed,
    error,
    lastUpdate,

    // Methods
    connect,
    disconnect,
    subscribe,

    // Raw socket for advanced usage
    socket: socketRef.current,
  };
}
