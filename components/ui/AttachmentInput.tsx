"use client";
import React, { useState, useEffect } from "react";
import {
  useAttachmentStore,
  Attachment,
  ExistingAttachment,
} from "@/app/(dashboard)/store/useAttachmentStore";
import AttachmentModal from "./AttachmentModal";
import XCircle from "@/icons/XCircle";
import Plus from "@/icons/Plus";
import Trash from "@/icons/Trash";

interface AttachmentInputProps {
  id: string;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  existingAttachments?: ExistingAttachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
}

export default function AttachmentInput({
  id,
  maxSizeMB = 100,
  accept = "*",
  label,
  existingAttachments = [],
  onAttachmentsChange,
}: AttachmentInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    attachments,
    existingAttachments: storeExistingAttachments,
    existingsToDelete,
    removeAttachment,
    clearAttachments,
    setExistingAttachments,
    deleteExistingAttachment,
    restoreExistingAttachment,
  } = useAttachmentStore();
  const computedLabel = label || `Attachments (Optional, max ${maxSizeMB}MB)`;

  // Set existing attachments when they change
  useEffect(() => {
    if (existingAttachments.length > 0) {
      setExistingAttachments(existingAttachments);
    }
  }, [existingAttachments, setExistingAttachments]);

  // Notify parent component when attachments change
  useEffect(() => {
    if (onAttachmentsChange) {
      onAttachmentsChange(attachments);
    }
  }, [attachments, onAttachmentsChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAttachments();
    };
  }, [clearAttachments]);

  const handleRemoveAttachment = (index: number) => {
    removeAttachment(index);
  };

  const handleDeleteExistingAttachment = (index: number) => {
    deleteExistingAttachment(index);
  };

  const handleRestoreExistingAttachment = (index: number) => {
    restoreExistingAttachment(index);
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
      {storeExistingAttachments.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            Existing Attachments
          </h4>
          <div className="space-y-2">
            {storeExistingAttachments.map((attachment, index) => (
              <div
                key={`existing-${index}`}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  isExpired(new Date(attachment.expiryDate))
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
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
                <button
                  type="button"
                  onClick={() => handleDeleteExistingAttachment(index)}
                  className="ml-2 text-slate-400 hover:text-red-600 flex-shrink-0 transition-colors"
                  aria-label="Delete existing attachment"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deleted Existing Attachments (for restoration) */}
      {existingsToDelete.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-500 mb-2">
            Deleted Attachments
          </h4>
          <div className="space-y-2">
            {existingsToDelete.map((attachment, index) => (
              <div
                key={`deleted-${index}`}
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
                  onClick={() => handleRestoreExistingAttachment(index)}
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
                className={`flex items-center justify-between p-3 rounded-md border ${
                  isExpired(attachment.expirationDate)
                    ? "bg-red-50 border-red-200"
                    : "bg-slate-50 border-slate-200"
                }`}
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
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="ml-2 text-slate-400 hover:text-red-600 flex-shrink-0 transition-colors"
                  aria-label="Remove attachment"
                >
                  <XCircle className="w-4 h-4" />
                </button>
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
