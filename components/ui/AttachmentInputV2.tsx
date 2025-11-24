"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAttachmentUploadStore } from "@/app/(dashboard)/store/useAttachmentUploadStore";
import type { AttachmentUploadItem } from "@/app/(dashboard)/store/useAttachmentUploadStore";

import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Plus from "@/icons/Plus";
import Trash from "@/icons/Trash";
import X from "@/icons/X";

interface AttachmentInputV2Props {
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  uploadEndpoint?: string;
  chunkSize?: number;
  onFilesChange?: (files: AttachmentUploadItem[]) => void;
}

const statusStyles: Record<
  AttachmentUploadItem["status"],
  { badge: string; highlight: string }
> = {
  queued: {
    badge: "bg-slate-900/80 text-white",
    highlight: "from-slate-100/70 via-transparent",
  },
  uploading: {
    badge: "bg-blue-600 text-white",
    highlight: "from-blue-100/70 via-transparent",
  },
  uploaded: {
    badge: "bg-green-600 text-white",
    highlight: "from-green-100/70 via-transparent",
  },
  error: {
    badge: "bg-red-600 text-white",
    highlight: "from-red-100/70 via-transparent",
  },
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

export default function AttachmentInputV2({
  label = "Attachments (beta)",
  description = "Drag and drop files here or click to browse.",
  accept = "*",
  maxSizeMB = 100,
  uploadEndpoint,
  chunkSize,
  onFilesChange,
}: AttachmentInputV2Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [expirationInput, setExpirationInput] = useState("");
  const [isGlobalFlag, setIsGlobalFlag] = useState(false);

  const files = useAttachmentUploadStore((state) => state.files);
  const order = useAttachmentUploadStore((state) => state.order);
  const addFiles = useAttachmentUploadStore((state) => state.addFiles);
  const removeFile = useAttachmentUploadStore((state) => state.removeFile);
  const clearAll = useAttachmentUploadStore((state) => state.clearAll);
  const setUploadEndpoint = useAttachmentUploadStore(
    (state) => state.setUploadEndpoint
  );
  const setChunkSize = useAttachmentUploadStore((state) => state.setChunkSize);

  const fileItems = useMemo(
    () => order.map((id) => files[id]).filter(Boolean),
    [files, order]
  );

  useEffect(() => {
    if (uploadEndpoint) {
      setUploadEndpoint(uploadEndpoint);
    }
  }, [uploadEndpoint, setUploadEndpoint]);

  useEffect(() => {
    if (chunkSize) {
      setChunkSize(chunkSize);
    }
  }, [chunkSize, setChunkSize]);

  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(fileItems);
    }
  }, [fileItems, onFilesChange]);

  const openMetadataDialog = (incoming: File[] | FileList) => {
    const files = Array.from(incoming ?? []);
    if (!files.length) return;
    setPendingFiles(files);
    setIsMetadataModalOpen(true);
  };

  const resetMetadataForm = () => {
    setExpirationInput("");
    setIsGlobalFlag(false);
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    openMetadataDialog(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files?.length) {
      openMetadataDialog(event.dataTransfer.files);
    }
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>, over: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(over);
  };

  const totalSize = useMemo(
    () => fileItems.reduce((acc, item) => acc + item.file.size, 0),
    [fileItems]
  );

  const handleMetadataConfirm = () => {
    if (!pendingFiles) return;
    addFiles(pendingFiles, {
      expiration: expirationInput
        ? new Date(expirationInput).toISOString()
        : null,
      isGlobal: isGlobalFlag,
    });
    setPendingFiles(null);
    setIsMetadataModalOpen(false);
    resetMetadataForm();
  };

  const handleMetadataCancel = () => {
    setPendingFiles(null);
    setIsMetadataModalOpen(false);
    resetMetadataForm();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <p className="text-xs text-slate-500 mt-1">
          {description} Max size per file: {maxSizeMB}MB
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(event) => handleDrag(event, true)}
        onDragLeave={(event) => handleDrag(event, false)}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          isDragOver
            ? "border-blue-500 bg-blue-50/70"
            : "border-slate-300 bg-slate-50/40"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Drop files here
            </p>
            <p className="text-xs text-slate-500">
              or click to browse files from your computer
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Select files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelection}
          accept={accept}
          className="hidden"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div>
          <span className="font-semibold text-slate-800">
            {fileItems.length}
          </span>{" "}
          file{fileItems.length === 1 ? "" : "s"} selected
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Total size
          </span>
          <span className="font-semibold text-slate-700">
            {formatBytes(totalSize)}
          </span>
          {fileItems.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-red-200 hover:text-red-600"
            >
              <Trash className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {fileItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-400"
          >
            No files selected yet.
          </motion.div>
        ) : (
          <div className="space-y-4">
            {fileItems.map((item) => {
              const status = statusStyles[item.status];
              const statusLabel =
                item.status === "uploading"
                  ? `${item.progress}%`
                  : item.status === "queued"
                  ? "Queued"
                  : item.status === "uploaded"
                  ? "Uploaded"
                  : "Error";

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm transition hover:shadow-md"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${status.highlight}`}
                    style={{
                      width:
                        item.status === "queued"
                          ? "8%"
                          : `${Math.min(Math.max(item.progress, 8), 100)}%`,
                    }}
                  />

                  <div className="absolute left-4 top-3 z-20">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow ${status.badge}`}
                    >
                      {item.status === "uploading" && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      )}
                      {statusLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1 text-slate-400 shadow hover:text-red-600"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                      <DocumentDuplicate className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {item.file.name}
                      </p>
                      <div className="flex flex-wrap gap-x-4 text-xs text-slate-500">
                        <span>{formatBytes(item.file.size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {item.file.type || "Unknown type"}
                        </span>
                        {item.status === "uploaded" && item.uploadedAt && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              Uploaded{" "}
                              {new Date(item.uploadedAt).toLocaleTimeString()}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {item.expiration && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                            Expires {new Date(item.expiration).toLocaleDateString()}
                          </span>
                        )}
                        {item.isGlobal && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                            Global
                          </span>
                        )}
                      </div>
                      {item.status === "error" && item.error && (
                        <p className="text-xs font-medium text-red-600">
                          {item.error}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-40">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "error"
                              ? "bg-red-500"
                              : item.status === "uploaded"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          } transition-all`}
                          style={{
                            width: `${Math.min(
                              item.status === "queued" ? 5 : item.progress,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-right text-xs font-semibold text-slate-500">
                        {item.status === "uploaded"
                          ? "100%"
                          : `${item.progress}%`}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMetadataModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-slate-900">
                  Attachment options
                </h4>
                <p className="text-sm text-slate-500">
                  Apply settings to {pendingFiles?.length ?? 0} file
                  {pendingFiles && pendingFiles.length > 1 ? "s" : ""} before we
                  enqueue them.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Expiration date (optional)
                  <input
                    type="date"
                    value={expirationInput}
                    onChange={(e) => setExpirationInput(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Make attachment global
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsGlobalFlag(false)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          !isGlobalFlag
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsGlobalFlag(true)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          isGlobalFlag
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Marking this radio-style option makes the attachment
                    available globally across supported areas.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleMetadataCancel}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMetadataConfirm}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                >
                  Add files
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
