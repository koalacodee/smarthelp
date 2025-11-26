"use client";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useAttachments } from "@/hooks/useAttachments";
import { UserResponse } from "@/lib/api";
import { env } from "next-runtime-env";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type AttachmentEventPayload = {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
  targetId: string | null;
  userId?: string;
  guestId?: string;
  isGlobal: boolean;
  size: number;
  cloned?: boolean;
  signedUrl: string;
};

export default function FileHubSubscriber() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const { addToast } = useToastStore();
  const { addExistingAttachmentToTarget, addMyAttachment } = useAttachments();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {
        addToast({
          message: "Unable to load user context for attachments.",
          type: "error",
        });
      });
  }, [addToast]);

  const subscribeToFileHub = useCallback(
    (userId: string) => {
      if (socketRef.current?.connected) return;
      socketRef.current?.disconnect();
      socketRef.current = io(
        `${env("NEXT_PUBLIC_BASE_SOCKET_IO_URL")}/filehub`,
        {
          transports: ["websocket"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }
      );
      socketRef.current.on("connect", () => {
        console.log("Connected to attachment groups");
        socketRef.current?.emit("filehub:subscribe", { userId });
      });
      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from attachment groups");
      });
      socketRef.current.on("error", (error) => {
        console.error("Error connecting to attachment groups", error);
      });
      socketRef.current.on(
        "filehub:attachment",
        (payload: AttachmentEventPayload) => {
          console.log("Attachment event", payload);
          addMyAttachment({
            id: payload.id,
            originalName: payload.originalName,
            filename: payload.filename,
            fileType: payload.type,
            size: payload.size,
            isGlobal: payload.isGlobal,
            expirationDate: payload.expirationDate
              ? payload.expirationDate
              : undefined,
            createdAt: payload.createdAt,
            signedUrl: payload.signedUrl,
          });
          if (payload.targetId) {
            addExistingAttachmentToTarget(payload.targetId, {
              id: payload.id,
              originalName: payload.originalName,
              filename: payload.filename,
              fileType: payload.type,
              size: payload.size,
              isGlobal: payload.isGlobal,
              createdAt: payload.createdAt,
              signedUrl: payload.signedUrl,
            });
          }
        }
      );
    },
    [addExistingAttachmentToTarget, addMyAttachment]
  );

  useEffect(() => {
    if (user?.id) {
      subscribeToFileHub(user.id);
    }
    return () => {
      socketRef.current?.disconnect();
    };
  }, [user?.id, subscribeToFileHub]);

  return null;
}
