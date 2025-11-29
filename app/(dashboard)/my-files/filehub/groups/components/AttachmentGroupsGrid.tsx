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
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleDelete = async (group: AttachmentGroupSummary) => {
    openConfirmation({
      title: "Delete TV content",
      message:
        "Are you sure you want to delete this TV content? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await FileHubAttachmentGroupService.deleteAttachmentGroup(group.id);
          addToast({
            message: "TV content deleted successfully.",
            type: "success",
          });
          setGroups(groups.filter((g) => g.id !== group.id));
          onGroupDeleted?.();
        } catch (err: any) {
          addToast({
            message:
              err?.message || "Failed to delete TV content. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  if (groups.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <DocumentDuplicate className="w-16 h-16 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-700">
            You don&apos;t have any TV content yet.
          </p>
          <p className="text-xs text-slate-500 max-w-md">
            Create TV content to share collections of files.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My TV Content</h2>
        <span className="text-xs font-medium text-slate-500">
          {groups.length} group{groups.length === 1 ? "" : "s"}
        </span>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <li
            key={group.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {group.key}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Group ID: {group.id.slice(0, 8)}...
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-800">
                {group.attachments.length} files
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
              {group.clientIds.length > 0 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {group.clientIds.length} watchers
                </span>
              )}
              {group.expiresAt && (
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    new Date(group.expiresAt) < new Date()
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {new Date(group.expiresAt) < new Date()
                    ? "Expired"
                    : `Expires ${new Date(
                        group.expiresAt
                      ).toLocaleDateString()}`}
                </span>
              )}
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              Created on {new Date(group.createdAt).toLocaleDateString()} at{" "}
              {new Date(group.createdAt).toLocaleTimeString()}
            </p>

            <div className="mt-3 flex justify-end gap-2">
              {onShare && (
                <button
                  type="button"
                  onClick={() => onShare(group)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                  aria-label="Share group"
                  title="Share group"
                >
                  <DocumentDuplicate className="w-4 h-4" />
                </button>
              )}
              {onView && (
                <button
                  type="button"
                  onClick={() => onView(group)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                  aria-label="View group"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(group)}
                  className="inline-flex items-center justify-center rounded-full border border-green-200 p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 transition"
                  aria-label="Edit group"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(group)}
                className="inline-flex items-center justify-center rounded-full border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                aria-label="Delete group"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
