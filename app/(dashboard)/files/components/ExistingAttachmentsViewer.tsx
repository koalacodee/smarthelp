"use client";

import { useState } from "react";
import { useAttachments } from "@/hooks/useAttachments";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateDisplay as formatDateDisplayWithHijri } from "@/locales/dateFormatter";

interface ExistingAttachmentsViewerProps {
  targetId: string;
  title?: string;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

export default function ExistingAttachmentsViewer({
  targetId,
  title = "Existing Attachments",
}: ExistingAttachmentsViewerProps) {
  const { existingAttachments } = useAttachments(targetId);
  const { openPreview } = useMediaPreviewStore();
  const language = useLocaleStore((state) => state.language);
  const [noPreviewFile, setNoPreviewFile] = useState<string | null>(null);

  const handlePreview = (attachment: {
    id: string;
    originalName?: string;
    filename: string;
    size: number;
    expirationDate?: string | Date | null;
    fileType?: string;
    signedUrl?: string;
  }) => {
    const displayName = attachment.originalName ?? attachment.filename;

    if (attachment.signedUrl) {
      openPreview({
        originalName: displayName,
        tokenOrId: attachment.signedUrl,
        fileType: attachment.fileType,
        sizeInBytes: attachment.size,
        expiryDate:
          attachment.expirationDate instanceof Date
            ? attachment.expirationDate.toISOString()
            : attachment.expirationDate || undefined,
      });
    } else {
      setNoPreviewFile(displayName);
    }
  };

  const attachments = existingAttachments;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>

      {attachments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-6 text-center text-xs text-slate-500">
          No attachments.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {attachments.map((attachment) => {
            const displayName =
              attachment.originalName ?? attachment.filename ?? "Untitled file";
            return (
              <li
                key={attachment.id}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                <button
                  type="button"
                  onClick={() =>
                    handlePreview({
                      id: attachment.id,
                      originalName: attachment.originalName,
                      filename: attachment.filename,
                      size: attachment.size,
                      expirationDate: attachment.expirationDate ?? null,
                      fileType: attachment.fileType,
                      signedUrl: attachment.signedUrl,
                    })
                  }
                  className="flex flex-1 items-center justify-between gap-3 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-900 group-hover:text-indigo-700">
                      {displayName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatBytes(attachment.size)} ·{" "}
                      {formatDateDisplayWithHijri(attachment.expirationDate, language)} ·{" "}
                      {attachment.signedUrl
                        ? "Preview available"
                        : "Preview not available"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 group-hover:border-indigo-300 group-hover:text-indigo-700">
                    Preview
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {noPreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Preview unavailable
            </h3>
            <p className="text-sm text-slate-600">
              We&apos;re sorry, but we can&apos;t show a preview for{" "}
              <span className="font-medium text-slate-900">
                {noPreviewFile}
              </span>{" "}
              right now. This file doesn&apos;t have a preview link associated
              with it.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setNoPreviewFile(null)}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
