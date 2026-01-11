"use client";

import React, { useState } from "react";
import { FileHubAttachmentGroupService } from "@/lib/api/v2";
import XCircle from "@/icons/XCircle";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface FileHubShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
}

export default function FileHubShareModal({
  isOpen,
  onClose,
  groupId,
}: FileHubShareModalProps) {
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { locale } = useLocaleStore();

  if (!locale) return null;

  React.useEffect(() => {
    if (isOpen && groupId) {
      generateShareLink();
    }
  }, [isOpen, groupId]);

  const generateShareLink = async () => {
    if (!groupId) return;

    setIsLoading(true);
    setError("");
    try {
      const groupDetails =
        await FileHubAttachmentGroupService.getAttachmentGroupDetails(groupId);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/f/a/g/${groupDetails.key}`;
      setShareLink(link);
    } catch (err) {
      setError("Failed to generate share link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
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
        // Fallback copy failed
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClose = () => {
    setShareLink("");
    setError("");
    setCopied(false);
    onClose();
  };

  if (!isOpen || !groupId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {locale.myFiles.groups.shareModal.title}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Share Link Display */}
            {shareLink && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {locale.myFiles.groups.shareModal.shareLink}
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
                    {copied
                      ? locale.myFiles.groups.shareModal.copied
                      : locale.myFiles.groups.shareModal.copy}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {locale.myFiles.groups.shareModal.linkHint}
                </p>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            {locale.myFiles.groups.shareModal.close}
          </button>
          {shareLink && (
            <button
              type="button"
              onClick={() => {
                window.open(shareLink, "_blank");
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              {locale.myFiles.groups.shareModal.openLink}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
