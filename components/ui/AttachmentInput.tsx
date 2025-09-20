"use client";
import React, { useState, useEffect } from "react";
import {
  useAttachmentStore,
  Attachment,
  ExistingAttachment,
} from "@/app/(dashboard)/store/useAttachmentStore";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import AttachmentModal from "./AttachmentModal";
import XCircle from "@/icons/XCircle";
import Plus from "@/icons/Plus";
import Trash from "@/icons/Trash";

interface AttachmentInputProps {
  id: string;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  existingAttachments?: Record<string, ExistingAttachment>;
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  // For getting attachment tokens/IDs for preview
  getAttachmentTokens?: (type: string, id: string) => string[];
  attachmentType?: string;
  attachmentId?: string;
}

export default function AttachmentInput({
  maxSizeMB = 100,
  accept = "*",
  label,
  existingAttachments = {},
  onAttachmentsChange,
}: AttachmentInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    attachments,
    existingAttachments: storeExistingAttachments,
    existingsToDelete,
    removeAttachment,
    setExistingAttachments,
    deleteExistingAttachment,
    restoreExistingAttachment,
  } = useAttachmentStore();
  const { openPreview } = useMediaPreviewStore();
  const computedLabel = label || `Attachments (Optional, max ${maxSizeMB}MB)`;

  // Set existing attachments when they change
  useEffect(() => {
    if (Object.keys(existingAttachments).length > 0) {
      setExistingAttachments(existingAttachments);
    }
  }, [existingAttachments, setExistingAttachments]);

  // Notify parent component when attachments change
  useEffect(() => {
    if (onAttachmentsChange) {
      onAttachmentsChange(attachments);
    }
  }, [attachments, onAttachmentsChange]);

  const handleRemoveAttachment = (index: number) => {
    removeAttachment(index);
  };

  const handleDeleteExistingAttachment = (id: string) => {
    deleteExistingAttachment(id);
  };

  const handleRestoreExistingAttachment = (id: string) => {
    restoreExistingAttachment(id);
  };

  const handlePreviewExistingAttachment = (
    attachmentId: string,
    attachment: ExistingAttachment
  ) => {
    openPreview({
      originalName: attachment.originalName,
      tokenOrId: attachmentId,
      fileType: attachment.fileType,
      sizeInBytes: attachment.sizeInBytes,
      expiryDate: attachment.expiryDate,
    });
  };

  const handlePreviewNewAttachment = (attachment: Attachment) => {
    // For new attachments, we can't preview them directly since they're not uploaded yet
    // We could create a preview URL from the File object
    const url = URL.createObjectURL(attachment.file);

    // Determine file type from MIME type
    let fileType = "unknown";
    if (attachment.file.type.startsWith("image/")) {
      fileType = "image";
    } else if (attachment.file.type.startsWith("video/")) {
      fileType = "video";
    } else if (attachment.file.type.startsWith("audio/")) {
      fileType = "audio";
    } else {
      // Fallback to file extension
      const extension = attachment.file.name.split(".").pop()?.toLowerCase();
      if (extension) {
        fileType = extension;
      }
    }

    openPreview({
      originalName: attachment.file.name,
      tokenOrId: url, // Use the blob URL for new attachments
      fileType: fileType,
      sizeInBytes: attachment.file.size,
      expiryDate: attachment.expirationDate.toISOString(),
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isExpired = (expirationDate: Date) => {
    return new Date() > expirationDate;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {computedLabel}
      </label>

      {/* Add Attachment Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Attachment
      </button>

      {/* Existing Attachments List */}
      {Object.keys(storeExistingAttachments).length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            Existing Attachments
          </h4>
          <div className="space-y-2">
            {Object.entries(storeExistingAttachments).map(
              ([id, attachment]) => (
                <div
                  key={`existing-${id}`}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer hover:shadow-md transition-all ${
                    isExpired(new Date(attachment.expiryDate))
                      ? "bg-red-50 border-red-200 hover:bg-red-100"
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  }`}
                  onClick={() =>
                    handlePreviewExistingAttachment(id, attachment)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(attachment.sizeInBytes)} •{" "}
                      {attachment.fileType} • Expires:{" "}
                      {new Date(attachment.expiryDate).toLocaleString()}
                      {isExpired(new Date(attachment.expiryDate)) && (
                        <span className="text-red-600 font-medium ml-1">
                          (EXPIRED)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExistingAttachment(id);
                      }}
                      className="text-slate-400 hover:text-red-600 flex-shrink-0 transition-colors"
                      aria-label="Delete existing attachment"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Deleted Existing Attachments (for restoration) */}
      {Object.keys(existingsToDelete).length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-500 mb-2">
            Deleted Attachments
          </h4>
          <div className="space-y-2">
            {Object.entries(existingsToDelete).map(([id, attachment]) => (
              <div
                key={`deleted-${id}`}
                className="flex items-center justify-between p-3 rounded-md border bg-gray-50 border-gray-200 opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500 truncate line-through">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(attachment.sizeInBytes)} •{" "}
                    {attachment.fileType}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestoreExistingAttachment(id)}
                  className="ml-2 text-slate-400 hover:text-green-600 flex-shrink-0 transition-colors"
                  aria-label="Restore deleted attachment"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Attachments List */}
      {attachments.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            New Attachments
          </h4>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={`new-${index}`}
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer hover:shadow-md transition-all ${
                  isExpired(attachment.expirationDate)
                    ? "bg-red-50 border-red-200 hover:bg-red-100"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
                onClick={() => handlePreviewNewAttachment(attachment)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {attachment.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.file.size)} • Expires:{" "}
                    {attachment.expirationDate.toLocaleString()}
                    {isExpired(attachment.expirationDate) && (
                      <span className="text-red-600 font-medium ml-1">
                        (EXPIRED)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAttachment(index);
                    }}
                    className="text-slate-400 hover:text-red-600 flex-shrink-0 transition-colors"
                    aria-label="Remove attachment"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxSizeMB={maxSizeMB}
        accept={accept}
      />
    </div>
  );
}
