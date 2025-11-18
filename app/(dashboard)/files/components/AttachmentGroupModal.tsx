"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AttachmentGroupService } from "@/lib/api/v2";
import X from "@/icons/X";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Plus from "@/icons/Plus";
import Trash from "@/icons/Trash";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import {
  Attachment,
  AttachmentGroup,
} from "@/lib/api/v2/services/attachment-group";

interface AttachmentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachmentGroup: AttachmentGroup | null;
  onUpdate?: () => void;
  availableAttachments?: Attachment[];
  mode?: "view" | "edit" | "create";
}

export default function AttachmentGroupModal({
  isOpen,
  onClose,
  attachmentGroup,
  onUpdate,
  availableAttachments = [],
  mode = "view",
}: AttachmentGroupModalProps) {
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAtInput, setExpiresAtInput] = useState("");
  const { addToast } = useToastStore();

  useEffect(() => {
    if (attachmentGroup) {
      setSelectedAttachmentIds(
        attachmentGroup.attachments.map((att) => att.id)
      );
      if (attachmentGroup.expiresAt) {
        const date = new Date(attachmentGroup.expiresAt);
        setExpiresAtInput(date.toISOString().slice(0, 16));
      } else {
        setExpiresAtInput("");
      }
    } else {
      setSelectedAttachmentIds([]);
      setExpiresAtInput("");
    }
  }, [attachmentGroup]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        attachmentIds: selectedAttachmentIds,
        ...(expiresAtInput
          ? { expiresAt: new Date(expiresAtInput) }
          : {}),
      };
      if (mode === "create") {
        // Create new attachment group
        await AttachmentGroupService.createAttachmentGroup(payload);

        addToast({
          message: "TV content created successfully",
          type: "success",
        });
      } else if (attachmentGroup) {
        // Update existing attachment group
        await AttachmentGroupService.updateAttachmentGroup(
          attachmentGroup.id,
          payload
        );

        addToast({
          message: "TV content updated successfully",
          type: "success",
        });
      }

      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      // Failed to ${mode} attachment group:
      addToast({
        message: `Failed to ${mode} TV content`,
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <DocumentDuplicate className="w-6 h-6 text-blue-500" />
                {mode === "create"
                  ? "Create TV Content"
                  : mode === "edit"
                    ? "Edit TV Content"
                    : "TV Content"}
              </h2>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
              {mode === "create" ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Create new TV content by selecting files from your
                      available attachments.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="attachment-group-expiration"
                      className="text-sm font-medium text-slate-700"
                    >
                      Expiration Date (optional)
                    </label>
                    <input
                      id="attachment-group-expiration"
                      type="datetime-local"
                      value={expiresAtInput}
                      onChange={(event) =>
                        setExpiresAtInput(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-xs text-slate-500">
                      Leave empty to keep this group available indefinitely.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-slate-800">
                        Selected Attachments ({selectedAttachmentIds.length})
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
                            className="border border-blue-400 bg-blue-50 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-2xl">📄</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-slate-500">
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
                    <h3 className="text-lg font-medium text-slate-800">
                      Available Attachments
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
                            className="border border-slate-200 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-2xl">📄</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleAttachment(attachment.id)}
                              className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
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
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">
                          Group Key:
                        </p>
                        <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                          {attachmentGroup.key}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">
                          Created At:
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(attachmentGroup.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">
                          Watchers:
                        </p>
                        <p className="text-sm text-slate-600">
                          {attachmentGroup.ips.length} IP addresses
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">
                          Expires At:
                        </p>
                        <p
                          className={`text-sm ${attachmentGroup.expiresAt &&
                            new Date(attachmentGroup.expiresAt) < new Date()
                            ? "text-red-600 font-semibold"
                            : "text-slate-600"
                            }`}
                        >
                          {attachmentGroup.expiresAt
                            ? new Date(
                              attachmentGroup.expiresAt
                            ).toLocaleString()
                            : "No expiration"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="attachment-group-expiration-edit"
                        className="text-sm font-medium text-slate-700"
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
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="text-xs text-slate-500">
                        Leave empty to remove the expiration date.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-slate-800">
                          Current Attachments ({selectedAttachmentIds.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {attachmentGroup.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={`border rounded-lg p-3 flex items-center justify-between ${selectedAttachmentIds.includes(attachment.id)
                              ? "border-blue-400 bg-blue-50"
                              : "border-slate-200"
                              }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-2xl">📄</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleAttachment(attachment.id)}
                              className={`p-2 rounded-md ${selectedAttachmentIds.includes(attachment.id)
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                }`}
                            >
                              {selectedAttachmentIds.includes(attachment.id) ? (
                                <Trash className="w-4 h-4" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {availableAttachments.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-slate-800">
                          Available Attachments
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
                                className={`border rounded-lg p-3 flex items-center justify-between ${selectedAttachmentIds.includes(attachment.id)
                                  ? "border-blue-400 bg-blue-50"
                                  : "border-slate-200"
                                  }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="text-2xl">📄</div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800 truncate">
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
                                  className={`p-2 rounded-md ${selectedAttachmentIds.includes(
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

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  isLoading ||
                  (mode === "create" && selectedAttachmentIds.length === 0)
                }
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${isLoading ||
                  (mode === "create" && selectedAttachmentIds.length === 0)
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                  } transition-colors`}
              >
                {isLoading
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Group"
                    : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
