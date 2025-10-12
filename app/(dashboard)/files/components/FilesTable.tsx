"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { Attachment } from "@/lib/api/v2/services/shared/upload";
import Eye from "@/icons/Eye";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Link from "@/icons/Link";

interface FilesTableProps {
  attachments: Attachment[];
  onShare: (attachment: Attachment) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileTypeFromExtension = (originalName: string) => {
  const extension = originalName.split(".").pop()?.toLowerCase();
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
      extension || ""
    )
  ) {
    return "image";
  } else if (
    ["mp4", "webm", "ogg", "avi", "mov", "wmv", "flv"].includes(extension || "")
  ) {
    return "video";
  } else if (
    ["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(extension || "")
  ) {
    return "audio";
  } else if (["pdf"].includes(extension || "")) {
    return "pdf";
  } else if (["doc", "docx"].includes(extension || "")) {
    return "document";
  } else if (["xls", "xlsx"].includes(extension || "")) {
    return "spreadsheet";
  } else if (["ppt", "pptx"].includes(extension || "")) {
    return "presentation";
  } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension || "")) {
    return "archive";
  } else {
    return "file";
  }
};

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "image":
      return "🖼️";
    case "video":
      return "🎥";
    case "audio":
      return "🎵";
    case "pdf":
      return "📄";
    case "document":
      return "📝";
    case "spreadsheet":
      return "📊";
    case "presentation":
      return "📋";
    case "archive":
      return "📦";
    default:
      return "📄";
  }
};

export default function FilesTable({ attachments, onShare }: FilesTableProps) {
  const { openPreview } = useMediaPreviewStore();

  const handlePreview = (attachment: Attachment) => {
    // Determine file type from extension or content type
    const fileType = getFileTypeFromExtension(attachment.originalName);

    openPreview({
      originalName: attachment.originalName,
      tokenOrId: attachment.id,
      fileType: fileType,
      sizeInBytes: attachment?.size || 0,
      expiryDate: attachment.expirationDate || "",
    });
  };

  const isExpired = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    return new Date() > new Date(expirationDate);
  };

  if (attachments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <DocumentDuplicate className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg font-medium">No files found</p>
        <p className="text-slate-400 text-sm mt-1">
          Upload some files to see them here
        </p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-slate-50/50">
            <tr>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                File
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Size
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Uploaded
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {attachments.map((attachment, index) => {
              const fileType = getFileTypeFromExtension(
                attachment.originalName
              );
              const expired = isExpired(attachment.expirationDate);

              return (
                <motion.tr
                  key={attachment.id}
                  className={`hover:bg-slate-50/50 transition-colors duration-200 group ${
                    expired ? "opacity-60" : ""
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {getFileIcon(fileType)}
                      </div>
                      <div className="min-w-0 flex-1 max-w-58">
                        <p
                          className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 truncate"
                          title={attachment.originalName}
                        >
                          {attachment.originalName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 capitalize">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {fileType}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-700">
                    <span className="font-medium bg-slate-100 px-3 py-1 rounded-full">
                      {formatFileSize(attachment?.size || 0)}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                    <div>
                      <p className="font-medium">
                        {new Date(attachment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(attachment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                    {attachment.expirationDate ? (
                      <div>
                        <p
                          className={`font-medium ${
                            expired ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {expired ? "Expired" : "Active"}
                        </p>
                        {attachment.expirationDate && (
                          <p className="text-xs text-slate-500">
                            Expires:{" "}
                            {new Date(
                              attachment.expirationDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Permanent
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        onClick={() => handlePreview(attachment)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          expired
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        }`}
                        disabled={expired}
                        whileHover={!expired ? { scale: 1.05 } : {}}
                        whileTap={!expired ? { scale: 0.95 } : {}}
                      >
                        <Eye className="w-4 h-4" />
                        {expired ? "Expired" : "Preview"}
                      </motion.button>
                      <motion.button
                        onClick={() => onShare(attachment)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          expired
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-green-600 hover:text-green-800 hover:bg-green-50"
                        }`}
                        disabled={expired}
                        whileHover={!expired ? { scale: 1.05 } : {}}
                        whileTap={!expired ? { scale: 0.95 } : {}}
                      >
                        <Link className="w-4 h-4" />
                        {expired ? "Expired" : "Share"}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
