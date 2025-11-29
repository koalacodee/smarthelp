"use client";

import React, { useEffect, useState, DragEvent, ChangeEvent } from "react";
import { FileHubService } from "@/lib/api/v2";
import type { FileHubAttachment } from "@/lib/api/v2/services/shared/filehub";
import { TusService } from "@/lib/api/v2/services/shared/tus";
import { env } from "next-runtime-env";
import Plus from "@/icons/Plus";
import X from "@/icons/X";
import Eye from "@/icons/Eye";
import Trash from "@/icons/Trash";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { useAttachments } from "@/hooks/useAttachments";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { UserResponse } from "@/lib/api";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileHubPage() {
  const { fetchMyAttachments, myAttachments, isLoadingMyAttachments } =
    useAttachments();
  const [error, setError] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [expirationInput, setExpirationInput] = useState("");
  const [isGlobalFlag, setIsGlobalFlag] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { openPreview } = useMediaPreviewStore();
  const [user, setUser] = useState<UserResponse | null>(null);
  const { openModal: openConfirmation } = useConfirmationModalStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  const getPreviewFileType = (file: File) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    const ext = file.name.split(".").pop()?.toLowerCase();
    return ext || "unknown";
  };

  useEffect(() => {
    fetchMyAttachments();
  }, []);

  const handleOpenUpload = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setExpirationInput("");
    setIsGlobalFlag(false);
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  const closeAllModals = () => {
    if (uploadStatus === "uploading") return;
    setIsUploadModalOpen(false);
    setIsMetadataModalOpen(false);
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadError(null);
  };

  const onFileChosen = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    // Prepare preview URL for the chosen file
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setFilePreviewUrl(nextUrl);
    setUploadError(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setIsMetadataModalOpen(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    onFileChosen(file ?? null);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileChosen(file);
    // allow selecting the same file again later
    event.target.value = "";
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    const tusUrl = env("NEXT_PUBLIC_TUS_UPLOAD_URL");
    if (!tusUrl) {
      setUploadError("Upload endpoint is not configured.");
      return;
    }

    try {
      setUploadStatus("uploading");
      setUploadError(null);
      setUploadProgress(0);

      // Generate a FileHub upload key for the current user
      const { uploadKey } = await FileHubService.generateUploadKey();
      const tusService = new TusService(tusUrl);

      const expirationDateIso = expirationInput
        ? new Date(`${expirationInput}T00:00:00`).toISOString()
        : "";

      const tusUpload = await tusService.upload({
        file: selectedFile,
        uploadKey,
        metadata: {
          expirationDate: expirationDateIso,
          isGlobal: isGlobalFlag,
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (!bytesTotal) return;
          const progress = Math.round((bytesUploaded / bytesTotal) * 100);
          setUploadProgress(progress);
        },
        onError: (err) => {
          console.error("Tus upload error", err);
          setUploadStatus("error");
          setUploadError(
            err?.message || "Failed to upload file. Please try again."
          );
        },
        onSuccess: () => {
          setUploadStatus("success");
          setUploadProgress(100);
          closeAllModals();
        },
      });

      tusUpload.start();
    } catch (err: any) {
      console.error(err);
      setUploadStatus("error");
      setUploadError(
        err?.message || "Failed to upload file. Please try again."
      );
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My FileHub</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse your previously uploaded attachments and add new ones.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Upload file
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            My attachments
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {myAttachments.length} item{myAttachments.length === 1 ? "" : "s"}
          </span>
        </header>

        {isLoadingMyAttachments ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            Loading your attachments...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : myAttachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              You don&apos;t have any attachments yet.
            </p>
            <p className="text-xs text-slate-500 max-w-md">
              Upload files to reuse them across FAQs, tasks, and other areas.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myAttachments.map((att) => (
              <li
                key={att.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {att.originalName || att.filename}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      {att.fileType || "Unknown type"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                    {Math.round(att.size / 1024)} KB
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {att.expirationDate && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                      Expires{" "}
                      {new Date(att.expirationDate).toLocaleDateString()}
                    </span>
                  )}
                  {att.isGlobal && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                      Global
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Uploaded on {new Date(att.createdAt).toLocaleDateString()} at{" "}
                  {new Date(att.createdAt).toLocaleTimeString()}
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tokenOrId = att.signedUrl || att.id;
                      const fileType =
                        att.fileType ||
                        att.originalName.split(".").pop() ||
                        "unknown";
                      openPreview({
                        originalName: att.originalName || att.filename,
                        tokenOrId,
                        fileType,
                        sizeInBytes: att.size,
                        expiryDate:
                          att.expirationDate === null
                            ? undefined
                            : att.expirationDate || undefined,
                      });
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                    aria-label="Preview attachment"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {user && att.userId === user.id && (
                    <button
                      type="button"
                      onClick={() => {
                        openConfirmation({
                          title: "Delete attachment",
                          message:
                            "Are you sure you want to delete this attachment? This action cannot be undone.",
                          confirmText: "Delete",
                          cancelText: "Cancel",
                          onConfirm: async () => {
                            try {
                              await FileHubService.deleteAttachments([att.id]);
                              addToast({
                                message: "Attachment deleted successfully.",
                                type: "success",
                              });
                              fetchMyAttachments();
                            } catch (err: any) {
                              addToast({
                                message:
                                  err?.message ||
                                  "Failed to delete attachment. Please try again.",
                                type: "error",
                              });
                            }
                          },
                        });
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                      aria-label="Delete attachment"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upload modal: select or drag file */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload a file
              </h3>
              <button
                type="button"
                onClick={closeAllModals}
                className="rounded-full p-1 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!selectedFile ? (
              <>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/60"
                  onClick={() => {
                    const input = document.getElementById(
                      "filehub-upload-input"
                    ) as HTMLInputElement | null;
                    input?.click();
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-600 mb-3">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    Drag &amp; drop a file here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Up to 100 MB per file. You&apos;ll set an expiration and
                    global flag in the next step.
                  </p>
                </div>

                <input
                  id="filehub-upload-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {expirationInput && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                          Expires {expirationInput}
                        </span>
                      )}
                      {isGlobalFlag && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                          Global
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedFile || !filePreviewUrl) return;
                      const fileType = getPreviewFileType(selectedFile);
                      openPreview({
                        originalName: selectedFile.name,
                        tokenOrId: filePreviewUrl,
                        fileType,
                        sizeInBytes: selectedFile.size,
                        expiryDate: undefined,
                      });
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMetadataModalOpen(true)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit metadata
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setExpirationInput("");
                      setIsGlobalFlag(false);
                      setUploadStatus("idle");
                      setUploadProgress(0);
                      setUploadError(null);
                      if (filePreviewUrl) {
                        URL.revokeObjectURL(filePreviewUrl);
                        setFilePreviewUrl(null);
                      }
                    }}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="mt-3 text-xs font-medium text-red-600">
                {uploadError}
              </p>
            )}

            {uploadStatus === "uploading" && (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAllModals}
                disabled={uploadStatus === "uploading"}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadConfirm}
                disabled={!selectedFile || uploadStatus === "uploading"}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {uploadStatus === "uploading" ? "Uploading..." : "Upload file"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadata modal: expiration + isGlobal */}
      {isMetadataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h4 className="text-base font-semibold text-slate-900">
                Attachment options
              </h4>
              {selectedFile && (
                <p className="mt-1 text-xs text-slate-500">
                  {selectedFile.name} ·{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Expiration date (optional)
                <input
                  type="date"
                  value={expirationInput}
                  onChange={(e) => setExpirationInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  Global attachments can be reused across multiple FAQs, tasks,
                  and other areas.
                </p>
              </div>
            </div>

            {uploadError && (
              <p className="mt-3 text-xs font-medium text-red-600">
                {uploadError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsMetadataModalOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsMetadataModalOpen(false)}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
