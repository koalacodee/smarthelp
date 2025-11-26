"use client";

import { env } from "next-runtime-env";
import { useAttachmentStore } from "./store/useAttachmentStore";
import { TusService } from "@/lib/api/v2/services/shared/tus";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadService } from "@/lib/api/v2";
import { Socket, io } from "socket.io-client";
// collision-resistant 10-digit ID for client-side use only
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

const random10DigitId = (() => {
  let seq = 0; // per-page sequence
  return () => {
    const tail = (++seq % 10000).toString().padStart(4, "0"); // 0000-9999
    const head = (Date.now() % 1_000_000).toString().padStart(6, "0"); // 6-digit ms slice
    return head + tail; // 6 + 4 = 10 digits
  };
})();
export const useAttachments = (targetId?: string) => {
  const {
    myAttachments,
    attachmentsToUpload,
    existingAttachments,
    attachmentsToDelete,
    selectedFormMyAttachments,
    currentNewTargetUploads,
    currentNewTargetSelections,
    updateCurrentNewTargetUpload,
    addCurrentNewTargetUpload,
    setMyAttachments,
    addMyAttachment,
    removeMyAttachment,
    clearMyAttachments,
    addAttachmentToUploadForTarget,
    updateAttachmentToUploadForTarget,
    deleteAttachmentFromExistingAttachments,
    removeAttachmentToUploadForTarget,
    clearAttachmentsToUploadForTarget,
    selectFormMyAttachmentForTarget,
    deselectFormMyAttachmentForTarget,
    addExistingAttachmentToTarget,
    clearSelectedAttachmentsForTarget,
    selectCurrentNewTargetAttachment,
    deselectCurrentNewTargetAttachment,
    toggleCurrentNewTargetAttachmentSelection,
    clearCurrentNewTargetSelections,
    moveCurrentNewTargetSelectionsToExisting,
    moveSelectedFormMyAttachmentsToExisting,
    moveCurrentNewTargetSelectionsToTarget,
    moveCurrentNewTargetUploadsToTarget,
    removeCurrentNewTargetUpload,
    clearCurrentNewTargetUploads,
  } = useAttachmentStore();
  const targetUploads = targetId
    ? attachmentsToUpload[targetId] || []
    : currentNewTargetUploads;

  const [uploadProgresses, setUploadProgresses] = useState<
    Record<string, number>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const subscribeToFileHub = useCallback(
    (userId: string) => {
      if (socketRef.current?.connected) return;
      socketRef.current?.disconnect();
      socketRef.current = io(
        `${env("NEXT_PUBLIC_API_URL")}/attachment-groups`,
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

  const handleUploadAttachment = (
    file: File,
    isGlobal: boolean,
    expirationDate: Date | null
  ) => {
    let id = random10DigitId();
    targetId
      ? addAttachmentToUploadForTarget(targetId, {
          file,
          isGlobal,
          expirationDate: expirationDate ?? undefined,
          filename: file.name,
          size: file.size,
          objectUrl: URL.createObjectURL(file),
          id,
          status: "queued",
        })
      : addCurrentNewTargetUpload({
          file,
          isGlobal,
          expirationDate: expirationDate ?? undefined,
          filename: file.name,
          size: file.size,
          objectUrl: URL.createObjectURL(file),
          id,
          status: "queued",
        });
    return id;
  };

  const uploadAttachments = async (uploadKey: string) => {
    const tusUrl = `${env("NEXT_PUBLIC_TUS_UPLOAD_URL")}`;
    const tusService = new TusService(tusUrl);
    setIsUploading(true);

    try {
      // Only upload files that haven't been successfully uploaded yet
      const pendingUploads = targetUploads.filter(
        (upload) => upload.status === "queued" || upload.status === "uploading"
      );

      for (const upload of pendingUploads) {
        await new Promise<void>(async (resolve, reject) => {
          const tusUpload = await tusService.upload({
            file: upload.file,
            uploadKey,
            metadata: {
              expirationDate: upload.expirationDate?.toISOString() || "",
              isGlobal: upload.isGlobal ? "1" : "0",
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              setUploadProgresses((prev) => ({
                ...prev,
                [upload.id]: (bytesUploaded / bytesTotal) * 100,
              }));
            },
            onError: (err) => {
              setUploadProgresses((prev) => ({
                ...prev,
                [upload.id]: 0,
              }));
              targetId
                ? updateAttachmentToUploadForTarget(targetId, upload.id, {
                    status: "failed",
                  })
                : updateCurrentNewTargetUpload(upload.id, {
                    status: "failed",
                  });
              reject(err);
            },
            onSuccess: () => {
              setUploadProgresses((prev) => ({
                ...prev,
                [upload.id]: 100,
              }));
              targetId
                ? updateAttachmentToUploadForTarget(targetId, upload.id, {
                    status: "completed",
                  })
                : updateCurrentNewTargetUpload(upload.id, {
                    status: "completed",
                  });
              resolve();
            },
          });

          tusUpload.start();
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getUploadProgress = (uploadId: string) => {
    return uploadProgresses[uploadId] || 0;
  };

  const fetchMyAttachments = useCallback(
    async (userId: string) => {
      const response = await UploadService.getMyAttachments();
      setMyAttachments(
        response.attachments.map((attachment) => ({
          originalName: attachment.originalName,
          filename: attachment.originalName,
          fileType: attachment.fileType,
          size: attachment.size,
          isGlobal: attachment.isGlobal,
          expirationDate: attachment.expirationDate ?? undefined,
          createdAt: attachment.createdAt,
          signedUrl: attachment.signedUrl,
          id: attachment.id,
        }))
      );
      subscribeToFileHub(userId);
    },
    [setMyAttachments, subscribeToFileHub]
  );

  const reset = () => {
    clearCurrentNewTargetSelections();
    clearCurrentNewTargetUploads();
  };

  return {
    handleUploadAttachment,
    uploadAttachments,
    getUploadProgress,
    fetchMyAttachments,
    deleteAttachmentFromExistingAttachments,
    removeAttachmentToUpload: (attachmentId: string) => {
      targetId
        ? removeAttachmentToUploadForTarget(targetId, attachmentId)
        : removeCurrentNewTargetUpload(attachmentId);
    },
    clearAttachmentsToUploadForTarget,
    selectFormMyAttachmentForTarget: (attachmentId: string) => {
      targetId
        ? selectFormMyAttachmentForTarget(targetId, attachmentId)
        : selectCurrentNewTargetAttachment(attachmentId);
    },
    deselectFormMyAttachment: (attachmentId: string) => {
      targetId
        ? deselectFormMyAttachmentForTarget(targetId, attachmentId)
        : deselectCurrentNewTargetAttachment(attachmentId);
    },
    clearSelectedAttachments: (targetId: string) => {
      targetId
        ? clearSelectedAttachmentsForTarget(targetId)
        : clearCurrentNewTargetSelections();
    },
    setAttachmentToUploadExpirationAndGlobalFlag: (
      attachmentId: string,
      expirationDate: Date | null,
      isGlobal: boolean
    ) => {
      targetId
        ? updateAttachmentToUploadForTarget(targetId, attachmentId, {
            expirationDate: expirationDate ?? undefined,
            isGlobal,
          })
        : updateCurrentNewTargetUpload(attachmentId, {
            expirationDate: expirationDate ?? undefined,
            isGlobal,
          });
    },
    myAttachments,
    existingAttachments: targetId ? existingAttachments[targetId] || [] : [],
    attachmentsToDelete: targetId ? attachmentsToDelete[targetId] || [] : [],
    selectedFormMyAttachments: targetId
      ? selectedFormMyAttachments[targetId] || []
      : currentNewTargetSelections,
    attachmentsToUpload: targetId
      ? attachmentsToUpload[targetId] || []
      : currentNewTargetUploads,
    failedAttachmentsToUpload: targetId
      ? targetUploads.filter((att) => att.status === "failed")
      : currentNewTargetUploads.filter((att) => att.status === "failed"),
    reset,
    moveCurrentNewTargetSelectionsToExisting,
    isUploading,
  };
};
