"use client";
import React, { useState, useMemo } from "react";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import XCircle from "@/icons/XCircle";
import CheckCircle from "@/icons/CheckCircle";

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxSizeMB?: number;
  accept?: string;
}

export default function AttachmentModal({
  isOpen,
  onClose,
  maxSizeMB = 15,
  accept = "*",
}: AttachmentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addAttachment } = useAttachmentStore();

  // Calculate expiration date based on day, hour, minute
  const expirationDate = useMemo(() => {
    const now = new Date();
    const expiration = new Date(now);
    expiration.setDate(now.getDate() + day);
    expiration.setHours(now.getHours() + hour);
    expiration.setMinutes(now.getMinutes() + minute);
    return expiration;
  }, [day, hour, minute]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Client-side validation for file type
      if (accept === "image/*" && !selectedFile.type.startsWith("image/")) {
        alert(
          "Invalid file type. Please select an image file (e.g., PNG, JPG, SVG)."
        );
        return;
      }

      // Client-side validation for file size
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        alert(
          `File is too large. Please upload files smaller than ${maxSizeMB}MB.`
        );
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const attachment: Attachment = {
        file,
        expirationDate,
      };

      addAttachment(attachment);
      onClose();

      // Reset form
      setFile(null);
      setDay(1);
      setHour(0);
      setMinute(0);
    } catch (error) {
      console.error("Error adding attachment:", error);
      alert("Failed to add attachment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setDay(1);
    setHour(0);
    setMinute(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Add Attachment
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label
              htmlFor="attachment-file"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              File <span className="text-red-500">*</span>
            </label>
            <input
              id="attachment-file"
              type="file"
              onChange={handleFileChange}
              accept={accept}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {file && (
              <div className="mt-2 p-2 bg-slate-100 rounded-md">
                <p className="text-sm text-slate-800">
                  <strong>Selected:</strong> {file.name} (
                  {(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Expiration Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Days
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={day}
                  onChange={(e) =>
                    setDay(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) =>
                    setHour(
                      Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) =>
                    setMinute(
                      Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Expires: {expirationDate.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!file || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? "Adding..." : "Add Attachment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
