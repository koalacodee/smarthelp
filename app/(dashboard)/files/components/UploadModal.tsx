"use client";

import React, { useState, useEffect } from "react";
import { UploadService } from "@/lib/api/v2";
import { useAttachmentStore } from "@/app/(dashboard)/store/useAttachmentStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import AttachmentInput from "@/components/ui/AttachmentInput";
import XCircle from "@/icons/XCircle";
import CheckCircle from "@/icons/CheckCircle";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export default function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadModalProps) {
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [uploadKey, setUploadKey] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const { attachments, clearAttachments } = useAttachmentStore();
  const { addToast } = useToastStore();

  // Generate upload key when modal opens
  useEffect(() => {
    if (isOpen && !uploadKey) {
      generateUploadKey();
    }
  }, [isOpen, uploadKey]);

  const generateUploadKey = async () => {
    setIsGeneratingKey(true);
    setError("");

    try {
      const response = await UploadService.generateUploadKey();
      setUploadKey(response.uploadKey);
    } catch (error) {
      setError("Failed to generate upload key. Please try again.");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleUpload = async () => {
    if (attachments.length === 0) {
      setError("Please add some files to upload.");
      return;
    }

    if (!uploadKey) {
      setError("No upload key available. Please generate a new key.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      if (attachments.length === 1) {
        // Single file upload
        const attachment = attachments[0];
        await UploadService.uploadSingleFile({
          file: attachment.file,
          expirationDate: attachment.expirationDate?.toISOString(),
          uploadKey,
        });
      } else {
        // Multiple files upload
        const files = attachments.map((att) => att.file);
        const expirationDates = attachments.map((att) =>
          att.expirationDate?.toISOString()
        );

        await UploadService.uploadMultipleFiles({
          files,
          expirationDates: expirationDates.filter(
            (date): date is string => date !== undefined
          ),
          uploadKey,
        });
      }

      // Clear attachments and close modal on success
      clearAttachments();
      onClose();

      // Show success toast
      addToast({
        type: "success",
        message: `Successfully uploaded ${attachments.length} file${
          attachments.length !== 1 ? "s" : ""
        }`,
      });

      // Notify parent component of successful upload
      onUploadSuccess?.();
    } catch (error) {
      setError("Upload failed. Please try again.");

      // Show error toast
      addToast({
        type: "error",
        message: "Failed to upload files. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      clearAttachments();
      setUploadKey("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Upload Files</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Upload Key Status */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex items-center gap-2">
            {isGeneratingKey ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-600">
                  Generating upload key...
                </span>
              </>
            ) : uploadKey ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">
                  Upload key generated successfully
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">
                  Failed to generate upload key
                </span>
              </>
            )}
          </div>
        </div>

        {/* Attachment Input */}
        <div className="mb-6">
          <AttachmentInput
            id="upload-modal"
            maxSizeMB={100}
            accept="*"
            label="Select files to upload"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={attachments.length === 0 || !uploadKey || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isUploading
              ? "Uploading..."
              : `Upload ${attachments.length} file${
                  attachments.length !== 1 ? "s" : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
