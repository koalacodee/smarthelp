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
import Search from "@/icons/Search";
import ArrowRight from "@/icons/ArrowRight";
import { motion } from "framer-motion";

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
    // New state and methods for "Choose From My Files" feature
    myAttachments,
    selectedAttachmentIds,
    selectedAttachments,
    isLoadingMyAttachments,
    myAttachmentsError,
    fetchMyAttachments,
    toggleAttachmentSelection,
    clearSelectedAttachments,
    addSelectedAttachmentsToExisting,
    moveSelectedToExisting,
    removeSelectedAttachment,
  } = useAttachmentStore();
  const { openPreview } = useMediaPreviewStore();
  const computedLabel = label || `Attachments (Optional, max ${maxSizeMB}MB)`;
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

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
      expiryDate: attachment.expiryDate || "",
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
      expiryDate: attachment.expirationDate?.toISOString() || "",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isExpired = (expirationDate?: Date) => {
    if (!expirationDate) return false;
    return new Date() > expirationDate;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {computedLabel}
      </label>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Attachment
        </button>
        <button
          type="button"
          onClick={() => {
            fetchMyAttachments();
            setIsSelectionModalOpen(true);
          }}
          className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <Search className="w-4 h-4 mr-2" />
          Choose From My Files
        </button>
      </div>

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
                    attachment.expiryDate &&
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
                      {attachment.fileType}
                      {attachment.expiryDate ? (
                        <>
                          {" • Expires: "}
                          {new Date(attachment.expiryDate).toLocaleString()}
                          {isExpired(new Date(attachment.expiryDate)) && (
                            <span className="text-red-600 font-medium ml-1">
                              (EXPIRED)
                            </span>
                          )}
                        </>
                      ) : (
                        " • No expiration"
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

      {/* Selected Attachments List */}
      {Object.keys(selectedAttachments).length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            Selected Attachments
          </h4>
          <div className="space-y-2">
            {Object.entries(selectedAttachments).map(([id, attachment]) => (
              <div
                key={`selected-${id}`}
                className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:shadow-md transition-all bg-green-50 border-green-200 hover:bg-green-100"
                onClick={() => handlePreviewExistingAttachment(id, attachment)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.sizeInBytes)} •{" "}
                    {attachment.fileType}
                    {attachment.expiryDate ? (
                      <>
                        {" • Expires: "}
                        {new Date(attachment.expiryDate).toLocaleString()}
                        {isExpired(new Date(attachment.expiryDate)) && (
                          <span className="text-red-600 font-medium ml-1">
                            (EXPIRED)
                          </span>
                        )}
                      </>
                    ) : (
                      " • No expiration"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedAttachment(id);
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
                  attachment.expirationDate &&
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
                    {formatFileSize(attachment.file.size)}
                    {attachment.expirationDate ? (
                      <>
                        {" • Expires: "}
                        {attachment.expirationDate.toLocaleString()}
                        {isExpired(attachment.expirationDate) && (
                          <span className="text-red-600 font-medium ml-1">
                            (EXPIRED)
                          </span>
                        )}
                      </>
                    ) : (
                      " • No expiration"
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

      {/* Choose From My Files Modal */}
      {isSelectionModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => {
            // Just close the modal without clearing selections
            setIsSelectionModalOpen(false);
          }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span>📁</span> Choose From My Files
              </h3>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  // Just close the modal without clearing selections
                  setIsSelectionModalOpen(false);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {isLoadingMyAttachments ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full mb-3"
                  ></motion.div>
                  <p>Loading attachments...</p>
                </div>
              ) : myAttachmentsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 text-sm mb-3">
                    Error: {myAttachmentsError}
                  </p>
                  <button
                    onClick={fetchMyAttachments}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : myAttachments.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>No attachments found.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-500">
                    Selected:{" "}
                    <span className="font-medium text-blue-600">
                      {selectedAttachmentIds.size}
                    </span>{" "}
                    attachment
                    {selectedAttachmentIds.size !== 1 ? "s" : ""}
                  </div>

                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {myAttachments.map((attachment) => (
                      <motion.div
                        key={attachment.id}
                        layout
                        whileHover={{ scale: 1.02 }}
                        className={`relative group p-4 border rounded-xl transition-all cursor-pointer ${
                          selectedAttachmentIds.has(attachment.id)
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleAttachmentSelection(attachment.id)}
                      >
                        <div className="absolute top-2 right-2">
                          {selectedAttachmentIds.has(attachment.id) ? (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </motion.div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-gray-400 transition-colors" />
                          )}
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-gray-700 font-semibold uppercase">
                            {attachment.fileType.slice(0, 3)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.originalName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </p>
                            {attachment.expirationDate && (
                              <p className="text-xs text-gray-400">
                                Expires:{" "}
                                {new Date(
                                  attachment.expirationDate
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              {/* Left side - Clear button */}
              <div>
                {selectedAttachmentIds.size > 0 && (
                  <button
                    onClick={() => {
                      clearSelectedAttachments();
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Right side - Cancel and Add buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Just close the modal without clearing selections
                    setIsSelectionModalOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => {
                    addSelectedAttachmentsToExisting();
                    setIsSelectionModalOpen(false);
                  }}
                  disabled={selectedAttachmentIds.size === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Selected ({selectedAttachmentIds.size})
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
