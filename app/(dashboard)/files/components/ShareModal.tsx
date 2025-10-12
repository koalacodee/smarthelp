"use client";

import React, { useState } from "react";
import { UploadService } from "@/lib/api/v2";
import { Attachment } from "@/lib/api/v2/services/shared/upload";
import XCircle from "@/icons/XCircle";
import CheckCircle from "@/icons/CheckCircle";
import DocumentDuplicate from "@/icons/DocumentDuplicate";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: Attachment | null;
}

export default function ShareModal({
  isOpen,
  onClose,
  attachment,
}: ShareModalProps) {
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!attachment) {
      setError("No attachment selected.");
      return;
    }

    setIsSharing(true);
    setError("");
    setShareLink("");

    try {
      const response = await UploadService.shareAttachment({
        attachmentId: attachment.id,
        expirationDate: expirationDate
          ? new Date(expirationDate).toISOString()
          : undefined,
      });

      // Create the share link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/attachment/${response.shareKey}`;
      setShareLink(link);
    } catch (error) {
      console.error("Failed to share attachment:", error);
      setError("Failed to share attachment. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClose = () => {
    setExpirationDate("");
    setShareLink("");
    setError("");
    setCopied(false);
    onClose();
  };

  if (!isOpen || !attachment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Share Attachment
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSharing}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Attachment Info */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-sm font-medium text-slate-800">
            {attachment.originalName}
          </p>
          <p className="text-xs text-slate-500">
            {attachment.size
              ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB`
              : "Unknown size"}{" "}
            • {attachment.fileType}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Expiration Date Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expiration Date{" "}
            <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="datetime-local"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Leave empty for no expiration. The shared link will be permanent.
          </p>
        </div>

        {/* Share Button */}
        {!shareLink && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isSharing ? "Sharing..." : "Generate Share Link"}
            </button>
          </div>
        )}

        {/* Share Link Display */}
        {shareLink && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50 text-slate-700"
              />
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <DocumentDuplicate className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {expirationDate && (
              <p className="text-xs text-slate-500 mt-1">
                Expires: {new Date(expirationDate).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          {shareLink && (
            <button
              type="button"
              onClick={() => {
                window.open(shareLink, "_blank");
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Open Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
