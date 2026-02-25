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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900">
            {locale.myFiles.groups.shareModal.title}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {locale.myFiles.groups.shareModal.shareLink}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <DocumentDuplicate className="h-4 w-4" />
                    {copied
                      ? locale.myFiles.groups.shareModal.copied
                      : locale.myFiles.groups.shareModal.copy}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {locale.myFiles.groups.shareModal.linkHint}
                </p>
              </div>
            )}
          </>
        )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 px-6 py-2 text-[0.95rem] font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100"
          >
            {locale.myFiles.groups.shareModal.close}
          </button>
          {shareLink && (
            <button
              type="button"
              onClick={() => {
                window.open(shareLink, "_blank");
              }}
              className="rounded-lg bg-blue-500 px-6 py-2 text-[0.95rem] font-semibold text-white transition hover:bg-blue-600"
            >
              {locale.myFiles.groups.shareModal.openLink}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
