"use client";

import { env } from "next-runtime-env";
import { useAttachmentStore } from "./store/useAttachmentStore";
import { TusService } from "@/lib/api/v2/services/shared/tus";
import { useCallback, useState } from "react";
import { FileHubService, UploadService } from "@/lib/api/v2";
// collision-resistant 10-digit ID for client-side use only

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
    addAttachmentToUploadForTarget,
    updateAttachmentToUploadForTarget,
    deleteAttachmentFromExistingAttachments,
    restoreAttachmentFromExistingAttachments,
    removeAttachmentToUploadForTarget,
    clearAttachmentsToUploadForTarget,
    setExistingAttachmentsForTarget,
    selectFormMyAttachmentForTarget,
    deselectFormMyAttachmentForTarget,
    addExistingAttachmentToTarget,
    clearSelectedAttachmentsForTarget,
    selectCurrentNewTargetAttachment,
    deselectCurrentNewTargetAttachment,
    clearCurrentNewTargetSelections,
    moveCurrentNewTargetSelectionsToExisting,
    moveSelectedFormMyAttachmentsToExisting,
    removeCurrentNewTargetUpload,
    clearCurrentNewTargetUploads,
    confirmExistingAttachmentsDeletionForTarget,
    clearExistingAttachmentsForTarget,
  } = useAttachmentStore();
  const targetUploads = targetId
    ? attachmentsToUpload[targetId] || []
    : currentNewTargetUploads;

  const [uploadProgresses, setUploadProgresses] = useState<
    Record<string, number>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingMyAttachments, setIsLoadingMyAttachments] = useState(false);

  const handleUploadAttachment = (
    file: File,
    isGlobal: boolean,
    expirationDate: Date | null
  ) => {
    setIsLoadingMyAttachments(true);
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
    setIsLoadingMyAttachments(false);
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
      // Once all pending uploads for this target have successfully completed,
      // clear them from the "pending uploads" collection so they don't linger
      // in the UI as completed-but-still-pending items.
      if (targetId) {
        clearAttachmentsToUploadForTarget(targetId);
      } else {
        clearCurrentNewTargetUploads();
      }
    } finally {
      setIsUploading(false);
      setIsLoadingMyAttachments(false);
    }
  };

  const getUploadProgress = (uploadId: string) => {
    return uploadProgresses[uploadId] || 0;
  };

  const fetchMyAttachments = useCallback(async () => {
    const response = await FileHubService.getMyAttachments();
    setMyAttachments(
      response.map((attachment) => ({
        originalName: attachment.originalName,
        filename: attachment.originalName,
        fileType: attachment.type,
        size: attachment.size,
        isGlobal: attachment.isGlobal,
        expirationDate: attachment.expirationDate ?? undefined,
        createdAt: attachment.createdAt,
        signedUrl: attachment.signedUrl,
        id: attachment.id,
        targetId,
        userId: attachment.userId,
      }))
    );
  }, [setMyAttachments]);

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
    restoreAttachmentFromExistingAttachments: (attachmentId: string) => {
      if (targetId) {
        restoreAttachmentFromExistingAttachments(targetId, attachmentId);
      }
    },
    confirmExistingAttachmentsDeletionForTarget,
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
    moveSelectedFormMyAttachmentsToExisting,
    isUploading,
    addMyAttachment,
    addExistingAttachmentToTarget,
    isLoadingMyAttachments,
    setExistingAttachmentsForTarget,
    clearExistingAttachmentsForTarget,
  };
};
