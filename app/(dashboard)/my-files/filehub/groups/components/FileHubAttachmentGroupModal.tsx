"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileHubAttachmentGroupService } from "@/lib/api/v2";
import X from "@/icons/X";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Plus from "@/icons/Plus";
import Trash from "@/icons/Trash";
import AttachmentClip from "@/icons/AttachmentClip";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import type {
  AttachmentGroupSummary,
  AttachmentMetadata,
} from "@/lib/api/v2/services/filehub-attachment-groups";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface FileHubAttachmentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachmentGroup: AttachmentGroupSummary | null;
  onUpdate?: () => void;
  availableAttachments?: AttachmentMetadata[];
  mode?: "view" | "edit" | "create";
}

export default function FileHubAttachmentGroupModal({
  isOpen,
  onClose,
  attachmentGroup,
  onUpdate,
  availableAttachments = [],
  mode = "view",
}: FileHubAttachmentGroupModalProps) {
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAtInput, setExpiresAtInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const { addToast } = useToastStore();
  const { locale } = useLocaleStore();

  if (!locale) return null;

  useEffect(() => {
    if (attachmentGroup) {
      setSelectedAttachmentIds(
        attachmentGroup.attachments.map((att) => att.id)
      );
      setNameInput(attachmentGroup.name || "");
      if (attachmentGroup.expiresAt) {
        const date = new Date(attachmentGroup.expiresAt);
        setExpiresAtInput(date.toISOString().slice(0, 16));
      } else {
        setExpiresAtInput("");
      }
    } else {
      setSelectedAttachmentIds([]);
      setNameInput("");
      setExpiresAtInput("");
    }
  }, [attachmentGroup]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        attachmentIds: selectedAttachmentIds,
        ...(expiresAtInput
          ? { expiresAt: new Date(expiresAtInput).toISOString() }
          : {}),
      };
      
      // Name is mandatory for creation, optional for updates
      if (mode === "create") {
        if (!nameInput.trim()) {
          addToast({
            message: locale?.myFiles?.groups?.modal?.nameRequired || "Name is required",
            type: "error",
          });
          setIsLoading(false);
          return;
        }
        payload.name = nameInput.trim();
      } else if (mode === "edit" && nameInput.trim()) {
        payload.name = nameInput.trim();
      }
      
      if (mode === "create") {
        // Create new attachment group
        await FileHubAttachmentGroupService.createAttachmentGroup(payload);

        addToast({
          message: locale.myFiles.groups.toasts.createSuccess,
          type: "success",
        });
      } else if (attachmentGroup) {
        // Update existing attachment group
        await FileHubAttachmentGroupService.updateAttachmentGroup(
          attachmentGroup.id,
          payload
        );

        addToast({
          message: locale.myFiles.groups.toasts.updateSuccess,
          type: "success",
        });
      }

      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      addToast({
        message:
          mode === "create"
            ? locale.myFiles.groups.toasts.createFailed
            : locale.myFiles.groups.toasts.updateFailed,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttachment = (attachmentId: string) => {
    if (selectedAttachmentIds.includes(attachmentId)) {
      setSelectedAttachmentIds(
        selectedAttachmentIds.filter((id) => id !== attachmentId)
      );
    } else {
      setSelectedAttachmentIds([...selectedAttachmentIds, attachmentId]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_rgba(0,0,0,0.25)] max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <DocumentDuplicate className="h-6 w-6 text-blue-500" />
                {mode === "create"
                  ? locale.myFiles.groups.modal.createTitle
                  : mode === "edit"
                  ? locale.myFiles.groups.modal.editTitle
                  : locale.myFiles.groups.modal.viewTitle}
              </h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
              {mode === "create" ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">
                      {locale.myFiles.groups.modal.createHint}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="attachment-group-name"
                      className="mb-1 block text-sm font-semibold text-gray-700"
                    >
                      {locale?.myFiles?.groups?.modal?.nameLabel || "Name"} *
                    </label>
                    <input
                      id="attachment-group-name"
                      type="text"
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      placeholder={locale?.myFiles?.groups?.modal?.namePlaceholder || "Enter group name"}
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="attachment-group-expiration"
                      className="mb-1 block text-sm font-semibold text-gray-700"
                    >
                      {locale.myFiles.groups.modal.expirationLabel}
                    </label>
                    <input
                      id="attachment-group-expiration"
                      type="datetime-local"
                      value={expiresAtInput}
                      onChange={(event) =>
                        setExpiresAtInput(event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {locale.myFiles.groups.modal.expirationHint}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {locale.myFiles.groups.modal.selectedAttachments.replace(
                          "{count}",
                          selectedAttachmentIds.length.toString()
                        )}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableAttachments
                        .filter((attachment) =>
                          selectedAttachmentIds.includes(attachment.id)
                        )
                        .map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between rounded-lg border border-blue-400 bg-blue-50 p-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-200 to-red-300 text-red-600">
                                <AttachmentClip className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleAttachment(attachment.id)}
                              className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {locale.myFiles.groups.modal.availableAttachments}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableAttachments
                        .filter(
                          (attachment) =>
                            !selectedAttachmentIds.includes(attachment.id)
                        )
                        .map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-200 to-red-300 text-red-600">
                                <AttachmentClip className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleAttachment(attachment.id)}
                              className="rounded-md bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                attachmentGroup && (
                  <div className="space-y-6">
                    <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">
                          {locale?.myFiles?.groups?.modal?.nameLabel || "Name"}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {attachmentGroup.name}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">
                          {locale.myFiles.groups.modal.groupKey}
                        </p>
                        <p className="rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                          {attachmentGroup.key}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">
                          {locale.myFiles.groups.modal.createdAt}
                        </p>
                        <p className="text-sm text-gray-700">
                          {new Date(attachmentGroup.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">
                          {locale.myFiles.groups.modal.watchers}
                        </p>
                        <p className="text-sm text-gray-700">
                          {locale.myFiles.groups.modal.clients.replace(
                            "{count}",
                            attachmentGroup.clientIds.length.toString()
                          )}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">
                          {locale.myFiles.groups.modal.expiresAt}
                        </p>
                        <p
                          className={`text-sm ${
                            attachmentGroup.expiresAt &&
                            new Date(attachmentGroup.expiresAt) < new Date()
                              ? "font-semibold text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          {attachmentGroup.expiresAt
                            ? new Date(
                                attachmentGroup.expiresAt
                              ).toLocaleString()
                            : locale.myFiles.groups.modal.noExpiration}
                        </p>
                      </div>
                    </div>

                    {mode === "edit" && (
                      <>
                        <div className="space-y-2">
                          <                          label
                            htmlFor="attachment-group-name-edit"
                            className="mb-1 block text-sm font-semibold text-gray-700"
                          >
                            {locale?.myFiles?.groups?.modal?.nameLabel || "Name"}
                          </label>
                          <input
                            id="attachment-group-name-edit"
                            type="text"
                            value={nameInput}
                            onChange={(event) => setNameInput(event.target.value)}
                            placeholder={locale?.myFiles?.groups?.modal?.namePlaceholder || "Enter group name"}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                          />
                          <p className="text-xs text-gray-500">
                            {locale?.myFiles?.groups?.modal?.nameHint || "Leave empty to keep current name."}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="attachment-group-expiration-edit"
                            className="mb-1 block text-sm font-semibold text-gray-700"
                          >
                            Update Expiration Date
                          </label>
                        <input
                          id="attachment-group-expiration-edit"
                          type="datetime-local"
                          value={expiresAtInput}
                          onChange={(event) =>
                            setExpiresAtInput(event.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                        <p className="text-xs text-slate-500">
                          Leave empty to remove the expiration date.
                        </p>
                      </div>
                      </>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Current Attachments ({selectedAttachmentIds.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {attachmentGroup.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={`border rounded-lg p-3 flex items-center justify-between ${
                              selectedAttachmentIds.includes(attachment.id)
                                ? "border-blue-400 bg-blue-50"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-200 to-red-300 text-red-600">
                                <AttachmentClip className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            {mode === "edit" && (
                              <button
                                onClick={() => toggleAttachment(attachment.id)}
                                className={`p-2 rounded-md ${
                                  selectedAttachmentIds.includes(attachment.id)
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                }`}
                              >
                                {selectedAttachmentIds.includes(
                                  attachment.id
                                ) ? (
                                  <Trash className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {mode === "edit" && availableAttachments.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {locale.myFiles.groups.modal.availableAttachments}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableAttachments
                            .filter(
                              (att) =>
                                !attachmentGroup.attachments.some(
                                  (groupAtt) => groupAtt.id === att.id
                                )
                            )
                            .map((attachment) => (
                              <div
                                key={attachment.id}
                                className={`border rounded-lg p-3 flex items-center justify-between ${
                                  selectedAttachmentIds.includes(attachment.id)
                                    ? "border-blue-400 bg-blue-50"
                                    : "border-slate-200"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-200 to-red-300 text-red-600">
                                    <AttachmentClip className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                      {attachment.originalName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    toggleAttachment(attachment.id)
                                  }
                                  className={`p-2 rounded-md ${
                                    selectedAttachmentIds.includes(
                                      attachment.id
                                    )
                                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                  }`}
                                >
                                  {selectedAttachmentIds.includes(
                                    attachment.id
                                  ) ? (
                                    <Trash className="w-4 h-4" />
                                  ) : (
                                    <Plus className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-5">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-6 py-2 text-[0.95rem] font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100"
              >
                {mode === "view"
                  ? locale.myFiles.groups.modal.close
                  : locale.myFiles.groups.modal.cancel}
              </button>
              {mode !== "view" && (
                <button
                  onClick={handleSave}
                  disabled={
                    isLoading ||
                    (mode === "create" && (selectedAttachmentIds.length === 0 || !nameInput.trim()))
                  }
                  className={`rounded-lg px-6 py-2 text-[0.95rem] font-semibold text-white transition ${
                    isLoading ||
                    (mode === "create" && selectedAttachmentIds.length === 0)
                      ? "cursor-not-allowed bg-blue-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isLoading
                    ? locale.myFiles.groups.modal.saving
                    : mode === "create"
                    ? locale.myFiles.groups.modal.createGroup
                    : locale.myFiles.groups.modal.saveChanges}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
