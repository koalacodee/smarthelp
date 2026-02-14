import { useEffect } from "react";
import {
  useAttachmentStore,
  type Attachment,
} from "@/hooks/store/useAttachmentStore";
import type { AttachmentResponse } from "../types";

/**
 * Maps a backend `AttachmentResponse` to the attachment store's `Attachment`
 * shape, following the same convention used by `fetchMyAttachments` in
 * `useAttachments`.
 */
export function toStoreAttachment(att: AttachmentResponse): Attachment {
  return {
    id: att.id,
    originalName: att.originalName,
    filename: att.originalName,
    fileType: att.type,
    size: att.size,
    isGlobal: att.isGlobal ?? false,
    expirationDate: att.expirationDate?.toString(),
    createdAt: att.createdAt.toString(),
    signedUrl: att.signedUrl,
    targetId: att.targetId,
    userId: att.userId,
  };
}

/**
 * Automatically upserts `AttachmentResponse[]` from a query result into the
 * global attachment store, keyed by each attachment's `targetId`.
 *
 * Call this inside any query hook that returns attachments so the attachment
 * store stays in sync without consumers having to do it manually.
 */
export function useSyncAttachments(
  attachments: AttachmentResponse[] | undefined,
) {
  const upsertExistingAttachmentForTarget =
    useAttachmentStore((s) => s.upsertExistingAttachmentForTarget);

  useEffect(() => {
    if (!attachments?.length) return;

    for (const att of attachments) {
      if (att.targetId) {
        upsertExistingAttachmentForTarget(att.targetId, toStoreAttachment(att));
      }
    }
  }, [attachments, upsertExistingAttachmentForTarget]);
}
