"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadService } from "@/lib/api/v2";
import type { GetAttachmentMetadataResponse } from "@/lib/api/v2/services/shared/upload";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Eye from "@/icons/Eye";

interface AttachmentPreviewerProps {
  fileHubAttachments: Record<string, string>; // {attachmentId: signedUrl}
  questionId?: string;
  label?: string;
}

interface AttachmentWithMetadata {
  id: string;
  signedUrl: string;
  metadata: GetAttachmentMetadataResponse | null;
  isLoading: boolean;
  error: string | null;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No expiration";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const isExpired = (expiryDate: string | null) => {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
};

export default function AttachmentPreviewer({
  fileHubAttachments,
  questionId,
  label = "FileHub Attachments",
}: AttachmentPreviewerProps) {
  const { openPreview } = useMediaPreviewStore();
  const [attachments, setAttachments] = useState<
    Record<string, AttachmentWithMetadata>
  >({});

  const attachmentEntries = useMemo(
    () => Object.entries(fileHubAttachments || {}),
    [fileHubAttachments]
  );

  useEffect(() => {
    if (attachmentEntries.length === 0) {
      setAttachments({});
      return;
    }

    const loadMetadata = async () => {
      const newAttachments: Record<string, AttachmentWithMetadata> = {};

      // Initialize all attachments with loading state
      for (const [attachmentId, signedUrl] of attachmentEntries) {
        newAttachments[attachmentId] = {
          id: attachmentId,
          signedUrl,
          metadata: null,
          isLoading: true,
          error: null,
        };
      }

      setAttachments(newAttachments);

      // Load metadata for each attachment
      const metadataPromises = attachmentEntries.map(
        async ([attachmentId, signedUrl]) => {
          try {
            const metadata = await UploadService.getAttachmentMetadata({
              tokenOrId: attachmentId,
            });
            return { attachmentId, metadata, error: null };
          } catch (error: any) {
            return {
              attachmentId,
              metadata: null,
              error: error?.message || "Failed to load metadata",
            };
          }
        }
      );

      const results = await Promise.all(metadataPromises);

      setAttachments((prev) => {
        const updated = { ...prev };
        results.forEach(({ attachmentId, metadata, error }) => {
          if (updated[attachmentId]) {
            updated[attachmentId] = {
              ...updated[attachmentId],
              metadata,
              isLoading: false,
              error,
            };
          }
        });
        return updated;
      });
    };

    loadMetadata();
  }, [attachmentEntries]);

  const handlePreview = (
    attachmentId: string,
    signedUrl: string,
    metadata: GetAttachmentMetadataResponse | null
  ) => {
    if (!metadata) return;

    // Use the signedUrl directly for preview
    openPreview({
      originalName: metadata.originalName,
      tokenOrId: signedUrl, // Use signedUrl for preview
      fileType: metadata.fileType,
      sizeInBytes: metadata.sizeInBytes,
      expiryDate: metadata.expiryDate || "",
    });
  };

  if (attachmentEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <p className="text-xs text-slate-500 mt-1">
          {attachmentEntries.length} file
          {attachmentEntries.length === 1 ? "" : "s"} attached via FileHub
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {attachmentEntries.map(([attachmentId, signedUrl]) => {
            const attachment = attachments[attachmentId];
            const metadata = attachment?.metadata;
            const isLoading = attachment?.isLoading ?? true;
            const error = attachment?.error;

            return (
              <motion.div
                key={attachmentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition hover:shadow-md"
              >
                <div className="absolute left-4 top-3 z-20">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
                    FileHub
                  </span>
                </div>

                <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                    <DocumentDuplicate className="h-6 w-6" />
                  </div>

                  <div className="flex-1 space-y-1 text-sm">
                    {isLoading ? (
                      <>
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                      </>
                    ) : error ? (
                      <>
                        <p className="truncate text-base font-semibold text-slate-900">
                          Attachment {attachmentId.slice(0, 8)}...
                        </p>
                        <p className="text-xs font-medium text-red-600">
                          {error}
                        </p>
                      </>
                    ) : metadata ? (
                      <>
                        <p className="truncate text-base font-semibold text-slate-900">
                          {metadata.originalName}
                        </p>
                        <div className="flex flex-wrap gap-x-4 text-xs text-slate-500">
                          <span>{formatBytes(metadata.sizeInBytes)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{metadata.fileType}</span>
                          {metadata.expiryDate && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span
                                className={
                                  isExpired(metadata.expiryDate)
                                    ? "text-red-600 font-medium"
                                    : ""
                                }
                              >
                                Expires {formatDate(metadata.expiryDate)}
                                {isExpired(metadata.expiryDate) && " (EXPIRED)"}
                              </span>
                            </>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>

                  {metadata && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePreview(attachmentId, signedUrl, metadata)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

