"use client";

import React, { useState } from "react";
import type { AttachmentGroupSummary } from "@/lib/api/v2/services/filehub-attachment-groups";
import Eye from "@/icons/Eye";
import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { FileHubAttachmentGroupService } from "@/lib/api/v2";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const FilmIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

interface AttachmentGroupsGridProps {
  attachmentGroups: AttachmentGroupSummary[];
  onGroupDeleted?: () => void;
  onView?: (group: AttachmentGroupSummary) => void;
  onEdit?: (group: AttachmentGroupSummary) => void;
  onShare?: (group: AttachmentGroupSummary) => void;
}

export default function AttachmentGroupsGrid({
  attachmentGroups,
  onGroupDeleted,
  onView,
  onEdit,
  onShare,
}: AttachmentGroupsGridProps) {
  const [groups, setGroups] = useState(attachmentGroups);
  const { openModal: openConfirmation } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { locale } = useLocaleStore();
  const language = useLocaleStore((state) => state.language);

  if (!locale) return null;

  const handleDelete = async (group: AttachmentGroupSummary) => {
    openConfirmation({
      title: locale.myFiles.groups.confirmations.deleteTitle,
      message: locale.myFiles.groups.confirmations.deleteMessage,
      confirmText: locale.myFiles.groups.confirmations.confirmText,
      cancelText: locale.myFiles.groups.confirmations.cancelText,
      onConfirm: async () => {
        try {
          await FileHubAttachmentGroupService.deleteAttachmentGroup(group.id);
          addToast({
            message: locale.myFiles.groups.toasts.deleteSuccess,
            type: "success",
          });
          setGroups(groups.filter((g) => g.id !== group.id));
          onGroupDeleted?.();
        } catch (err: any) {
          addToast({
            message: err?.message || locale.myFiles.groups.toasts.deleteFailed,
            type: "error",
          });
        }
      },
    });
  };

  if (groups.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
          <DocumentDuplicate className="mb-2 h-16 w-16 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">
            {locale.myFiles.groups.grid.empty.title}
          </p>
          <p className="max-w-md text-xs text-gray-500">
            {locale.myFiles.groups.grid.empty.hint}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {locale.myFiles.groups.grid.title}
        </h2>
        <span className="text-sm text-gray-500">
          {locale.myFiles.groups.grid.count
            .replace("{count}", groups.length.toString())
            .replace("{plural}", groups.length === 1 ? "" : "s")}
        </span>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <li
            key={group.id}
            className="flex flex-col rounded-[10px] border border-gray-200 bg-white p-5 transition hover:border-blue-500 hover:shadow-[0_4px_12px_rgba(59,130,246,0.1)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-gray-900">
                  {group.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {locale.myFiles.groups.grid.groupId.replace(
                    "{id}",
                    group.key.slice(0, 8)
                  )}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                {locale.myFiles.groups.grid.files.replace(
                  "{count}",
                  group.attachments.length.toString()
                )}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
              {group.clientIds.length > 0 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                  {locale.myFiles.groups.grid.watchers.replace(
                    "{count}",
                    group.clientIds.length.toString()
                  )}
                </span>
              )}
              {group.expiresAt && (
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${new Date(group.expiresAt) < new Date()
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                    }`}
                >
                  {new Date(group.expiresAt) < new Date()
                    ? locale.myFiles.groups.grid.expired
                    : locale.myFiles.groups.grid.expires.replace(
                      "{date}",
                      new Date(group.expiresAt).toLocaleDateString()
                    )}
                </span>
              )}
            </div>

            <p className="mt-2 text-[11px] text-gray-400">
              {locale.myFiles.groups.grid.createdOn
                .replace(
                  "{date}",
                  formatDateWithHijri(group.createdAt, language)
                )
                .replace(
                  "{time}",
                  new Date(group.createdAt).toLocaleTimeString()
                )}
            </p>

            {group.attachments.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <FilmIcon className="h-3.5 w-3.5" />
                  {"Attachments"}:
                </div>
                <div className="space-y-1.5">
                  {group.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2.5 rounded-md bg-gray-50 px-2 py-2 text-[0.8rem]"
                    >
                      <div className="flex h-[30px] w-[50px] shrink-0 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <PlayIcon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-gray-700">
                          {att.originalName}
                        </div>
                        <div className="text-[0.7rem] text-gray-400">
                          {formatFileSize(att.size)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
              {onShare && (
                <button
                  type="button"
                  onClick={() => onShare(group)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label={locale.myFiles.groups.grid.share}
                  title={locale.myFiles.groups.grid.share}
                >
                  <DocumentDuplicate className="h-4 w-4" />
                </button>
              )}
              {onView && (
                <button
                  type="button"
                  onClick={() => onView(group)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label={locale.myFiles.groups.grid.view}
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(group)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600 transition hover:bg-green-100"
                  aria-label={locale.myFiles.groups.grid.edit}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(group)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                aria-label={locale.myFiles.groups.grid.delete}
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
