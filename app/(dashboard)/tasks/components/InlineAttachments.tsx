"use client";

import { useState } from "react";
import { useAttachments } from "@/hooks/useAttachments";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import Clock from "@/icons/Clock";
import TeamTaskCard from "./TeamTaskCard";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateShort } from "@/locales/dateFormatter";

// Reuse the inline PaperClip icon defined in TeamTaskCard
const PaperClipIcon =
  (TeamTaskCard as any).PaperClipIcon ||
  (({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
  ));

interface TaskInlineAttachmentsProps {
  targetId: string;
}

export default function InlineAttachments({
  targetId,
}: TaskInlineAttachmentsProps) {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const { existingAttachments } = useAttachments(targetId);
  const { openPreview } = useMediaPreviewStore();
  const [noPreviewFile, setNoPreviewFile] = useState<string | null>(null);

  const attachments = existingAttachments;
  if (!attachments.length || !locale) return null;

  const handleClick = (attachment: (typeof attachments)[number]) => {
    const name =
      attachment.originalName ??
      attachment.filename ??
      locale.tasks.teamTasks.card.attachment;

    if (attachment.signedUrl) {
      openPreview({
        originalName: name,
        tokenOrId: attachment.signedUrl,
        fileType: attachment.fileType,
        sizeInBytes: attachment.size,
        expiryDate: attachment.expirationDate || undefined,
      });
    } else {
      setNoPreviewFile(name);
    }
  };

  return (
    <>
      <div className="border-t border-gray-200 pt-3 mb-4">
        <div className="space-y-2">
          {attachments.map((attachment, index) => {
            const name =
              attachment.originalName ??
              attachment.filename ??
              `${locale.tasks.teamTasks.card.attachment} ${index + 1}`;
            const createdAt = attachment.createdAt ?? null;

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                onClick={() => handleClick(attachment)}
              >
                <PaperClipIcon className="w-3 h-3 text-blue-500" />
                <span className="truncate text-blue-500 hover:text-blue-600 transition-colors">
                  {name}
                </span>
                <Clock className="w-3 h-3 text-gray-400" />
                {createdAt && (
                  <span className="text-gray-400">{formatDateShort(createdAt, language)}</span>
                )}
                <button
                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(attachment);
                  }}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

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
                {locale.tasks.modals.editTask.buttons.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
