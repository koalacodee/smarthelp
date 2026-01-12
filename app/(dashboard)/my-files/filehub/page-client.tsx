"use client";

import React, {
  useEffect,
  useState,
  DragEvent,
  ChangeEvent,
  useMemo,
} from "react";
import { FileHubService } from "@/lib/api/v2";
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
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";
import { Attachment } from "@/hooks/store/useAttachmentStore";

type UploadStatus = "idle" | "uploading" | "success" | "error";
type TabType = "all" | "documents" | "videos" | "images" | "audio";

interface FileHubPageClientProps {
  locale: Locale;
  language: string;
}

// Helper to get file extension from filename or type
function getFileExtension(attachment: Attachment): string {
  const ext =
    attachment.originalName?.split(".").pop()?.toLowerCase() ||
    attachment.filename?.split(".").pop()?.toLowerCase() ||
    attachment.fileType?.split("/").pop()?.toLowerCase() ||
    "";
  return ext;
}

// Helper to determine if file is a document
function isDocument(attachment: Attachment): boolean {
  const ext = getFileExtension(attachment);
  const docExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "rtf",
    "odt",
    "ods",
    "odp",
    "csv",
  ];
  return docExtensions.includes(ext);
}

// Helper to determine if file is a video
function isVideo(attachment: Attachment): boolean {
  const ext = getFileExtension(attachment);
  const videoExtensions = [
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "wmv",
    "flv",
    "m4v",
  ];
  return videoExtensions.includes(ext);
}

// Helper to determine if file is an image
function isImage(attachment: Attachment): boolean {
  const ext = getFileExtension(attachment);
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "tiff",
    "tif",
    "avif",
  ];
  return imageExtensions.includes(ext);
}

// Helper to determine if file is audio
function isAudio(attachment: Attachment): boolean {
  const ext = getFileExtension(attachment);
  const audioExtensions = [
    "mp3",
    "wav",
    "ogg",
    "flac",
    "aac",
    "wma",
    "m4a",
    "opus",
  ];
  return audioExtensions.includes(ext);
}

// Helper to get badge color based on file extension
function getBadgeColor(ext: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    // Documents
    pdf: { bg: "bg-red-500", text: "text-white" },
    doc: { bg: "bg-blue-600", text: "text-white" },
    docx: { bg: "bg-blue-600", text: "text-white" },
    xls: { bg: "bg-green-600", text: "text-white" },
    xlsx: { bg: "bg-green-600", text: "text-white" },
    ppt: { bg: "bg-orange-500", text: "text-white" },
    pptx: { bg: "bg-orange-500", text: "text-white" },
    txt: { bg: "bg-slate-500", text: "text-white" },
    csv: { bg: "bg-green-600", text: "text-white" },
    // Videos
    mp4: { bg: "bg-emerald-500", text: "text-white" },
    mov: { bg: "bg-emerald-500", text: "text-white" },
    avi: { bg: "bg-emerald-500", text: "text-white" },
    mkv: { bg: "bg-emerald-500", text: "text-white" },
    webm: { bg: "bg-emerald-500", text: "text-white" },
    // Images
    jpg: { bg: "bg-pink-500", text: "text-white" },
    jpeg: { bg: "bg-pink-500", text: "text-white" },
    png: { bg: "bg-pink-500", text: "text-white" },
    gif: { bg: "bg-pink-500", text: "text-white" },
    webp: { bg: "bg-pink-500", text: "text-white" },
    svg: { bg: "bg-pink-500", text: "text-white" },
    bmp: { bg: "bg-pink-500", text: "text-white" },
    avif: { bg: "bg-pink-500", text: "text-white" },
    // Audio
    mp3: { bg: "bg-violet-500", text: "text-white" },
    wav: { bg: "bg-violet-500", text: "text-white" },
    ogg: { bg: "bg-violet-500", text: "text-white" },
    flac: { bg: "bg-violet-500", text: "text-white" },
    aac: { bg: "bg-violet-500", text: "text-white" },
    m4a: { bg: "bg-violet-500", text: "text-white" },
  };
  return colors[ext] || { bg: "bg-slate-500", text: "text-white" };
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Document icon SVG component
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

// Video icon SVG component (play button style)
function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
      />
    </svg>
  );
}

// Image icon SVG component
function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

// Audio icon SVG component
function AudioIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
      />
    </svg>
  );
}

// Search icon SVG component
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

// Filter icon SVG component
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
      />
    </svg>
  );
}

export default function FileHubPageClient({
  locale,
  language,
}: FileHubPageClientProps) {
  const { fetchMyAttachments, myAttachments, isLoadingMyAttachments } =
    useAttachments();
  const [error] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

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
  const { setLocale } = useLocaleStore();

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);

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

  // Filter and categorize attachments
  const { documents, videos, images, audio, filteredAttachments } =
    useMemo(() => {
      let filtered = myAttachments;

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (att) =>
            att.originalName?.toLowerCase().includes(query) ||
            att.filename?.toLowerCase().includes(query)
        );
      }

      const docs = filtered.filter(isDocument);
      const vids = filtered.filter(isVideo);
      const imgs = filtered.filter(isImage);
      const auds = filtered.filter(isAudio);

      // Apply tab filter
      if (activeTab === "documents") {
        filtered = docs;
      } else if (activeTab === "videos") {
        filtered = vids;
      } else if (activeTab === "images") {
        filtered = imgs;
      } else if (activeTab === "audio") {
        filtered = auds;
      }

      return {
        documents: docs,
        videos: vids,
        images: imgs,
        audio: auds,
        filteredAttachments: filtered,
      };
    }, [myAttachments, searchQuery, activeTab]);

  // Count for tabs
  const allCount = myAttachments.length;
  const docsCount = myAttachments.filter(isDocument).length;
  const videosCount = myAttachments.filter(isVideo).length;
  const imagesCount = myAttachments.filter(isImage).length;
  const audioCount = myAttachments.filter(isAudio).length;

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
    event.target.value = "";
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile) {
      const { locale: storeLocale } = useLocaleStore.getState();
      setUploadError(
        storeLocale?.myFiles?.filehub?.uploadModal?.selectFileError ||
          "Please select a file to upload."
      );
      return;
    }

    const tusUrl = env("NEXT_PUBLIC_TUS_UPLOAD_URL");
    if (!tusUrl) {
      const { locale: storeLocale } = useLocaleStore.getState();
      setUploadError(
        storeLocale?.myFiles?.filehub?.uploadModal?.endpointError ||
          "Upload endpoint is not configured."
      );
      return;
    }

    try {
      setUploadStatus("uploading");
      setUploadError(null);
      setUploadProgress(0);

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
          const { locale: storeLocale } = useLocaleStore.getState();
          setUploadError(
            err?.message ||
              storeLocale?.myFiles?.filehub?.toasts?.uploadFailed ||
              "Failed to upload file. Please try again."
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

  const handleDelete = (att: Attachment) => {
    const { locale: storeLocale } = useLocaleStore.getState();
    openConfirmation({
      title:
        storeLocale?.myFiles?.filehub?.confirmations?.deleteTitle ||
        "Delete attachment",
      message:
        storeLocale?.myFiles?.filehub?.confirmations?.deleteMessage ||
        "Are you sure you want to delete this attachment? This action cannot be undone.",
      confirmText:
        storeLocale?.myFiles?.filehub?.confirmations?.confirmText || "Delete",
      cancelText:
        storeLocale?.myFiles?.filehub?.confirmations?.cancelText || "Cancel",
      onConfirm: async () => {
        try {
          await FileHubService.deleteAttachments([att.id]);
          addToast({
            message:
              storeLocale?.myFiles?.filehub?.toasts?.deleteSuccess ||
              "Attachment deleted successfully.",
            type: "success",
          });
          fetchMyAttachments();
        } catch (err: any) {
          addToast({
            message:
              err?.message ||
              storeLocale?.myFiles?.filehub?.toasts?.deleteFailed ||
              "Failed to delete attachment. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  const handlePreview = (att: Attachment) => {
    const tokenOrId = att.signedUrl || att.id;
    const fileType =
      att.fileType || att.originalName.split(".").pop() || "unknown";
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
  };

  // Helper to get the appropriate icon for a file
  const getFileIcon = (att: Attachment) => {
    if (isVideo(att)) return <VideoIcon className="w-12 h-12 text-slate-300" />;
    if (isImage(att)) return <ImageIcon className="w-12 h-12 text-slate-300" />;
    if (isAudio(att)) return <AudioIcon className="w-12 h-12 text-slate-300" />;
    return <DocumentIcon className="w-12 h-12 text-slate-300" />;
  };

  // Render a file card
  const renderFileCard = (att: Attachment) => {
    const ext = getFileExtension(att);
    const badgeColor = getBadgeColor(ext);
    const isHovered = hoveredCardId === att.id;
    const canDelete = user && att.userId === user.id;

    return (
      <div
        key={att.id}
        className={`relative flex flex-col rounded-xl border transition-shadow bg-white border-slate-200 ${
          isHovered ? "shadow-lg" : "shadow-sm"
        }`}
        onMouseEnter={() => setHoveredCardId(att.id)}
        onMouseLeave={() => setHoveredCardId(null)}
      >
        {/* File type badge */}
        <div className="absolute top-3 start-3 z-10">
          <span
            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded ${badgeColor.bg} ${badgeColor.text}`}
          >
            {ext.toUpperCase()}
          </span>
        </div>

        {/* Hover actions */}
        {isHovered && (
          <div className="absolute top-3 end-3 z-10 flex gap-1">
            <button
              type="button"
              onClick={() => handlePreview(att)}
              className="rounded-md bg-white/90 p-1.5 text-slate-600 hover:bg-white hover:text-blue-600 shadow-sm transition"
              aria-label={locale.myFiles.filehub.attachments.preview}
            >
              <Eye className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => handleDelete(att)}
                className="rounded-md bg-white/90 p-1.5 text-slate-600 hover:bg-white hover:text-red-600 shadow-sm transition"
                aria-label={locale.myFiles.filehub.attachments.delete}
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Icon area */}
        <div className="flex items-center justify-center py-8 bg-slate-50 rounded-t-xl">
          {getFileIcon(att)}
        </div>

        {/* File info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold truncate flex-1 text-slate-900">
              {att.originalName || att.filename}
            </p>
            <span className="shrink-0 text-xs text-slate-500">
              {formatFileSize(att.size)}
            </span>
          </div>

          <p className="mt-0.5 text-xs truncate text-slate-500">
            {ext.toUpperCase()} •{" "}
            {att.fileType || locale.myFiles.filehub.attachments.unknownType}
          </p>

          {/* Global badge */}
          {att.isGlobal && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale.myFiles.filehub.attachments.global.toUpperCase()}
              </span>
            </div>
          )}

          {/* Date */}
          <p className="mt-auto pt-2 text-[11px] text-slate-400">
            {formatDateWithHijri(att.createdAt, language)}
          </p>
        </div>
      </div>
    );
  };

  // Render section with files
  const renderSection = (title: string, items: Attachment[]) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-amber-500 rounded-full" />
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <span className="text-sm text-slate-500">
            {locale.myFiles.filehub.sections.items.replace(
              "{count}",
              items.length.toString()
            )}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((att) => renderFileCard(att))}
        </div>
      </section>
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === "all"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale.myFiles.filehub.tabs.allFiles}
            <span
              className={`ms-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === "all"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {allCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === "documents"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale.myFiles.filehub.tabs.documents}
            <span
              className={`ms-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === "documents"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {docsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === "videos"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale.myFiles.filehub.tabs.videos}
            <span
              className={`ms-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === "videos"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {videosCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === "images"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale.myFiles.filehub.tabs.images}
            <span
              className={`ms-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === "images"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {imagesCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === "audio"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale.myFiles.filehub.tabs.audio}
            <span
              className={`ms-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === "audio"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {audioCount}
            </span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={locale.myFiles.filehub.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 ps-10 pe-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={handleOpenUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          {locale.myFiles.filehub.uploadButton}
        </button>
      </div>

      {/* Loading State */}
      {isLoadingMyAttachments ? (
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          {locale.myFiles.filehub.attachments.loading}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : filteredAttachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            {locale.myFiles.filehub.attachments.empty.title}
          </p>
          <p className="text-xs text-slate-500 max-w-md">
            {locale.myFiles.filehub.attachments.empty.hint}
          </p>
        </div>
      ) : activeTab === "all" ? (
        <>
          {renderSection(locale.myFiles.filehub.sections.documents, documents)}
          {renderSection(locale.myFiles.filehub.sections.videos, videos)}
          {renderSection(locale.myFiles.filehub.sections.images, images)}
          {renderSection(locale.myFiles.filehub.sections.audio, audio)}
          {/* Other files that don't fit into categories */}
          {filteredAttachments.filter(
            (att) =>
              !isDocument(att) &&
              !isVideo(att) &&
              !isImage(att) &&
              !isAudio(att)
          ).length > 0 &&
            renderSection(
              locale.myFiles.filehub.attachments.title,
              filteredAttachments.filter(
                (att) =>
                  !isDocument(att) &&
                  !isVideo(att) &&
                  !isImage(att) &&
                  !isAudio(att)
              )
            )}
        </>
      ) : activeTab === "documents" ? (
        renderSection(
          locale.myFiles.filehub.sections.documents,
          filteredAttachments
        )
      ) : activeTab === "videos" ? (
        renderSection(
          locale.myFiles.filehub.sections.videos,
          filteredAttachments
        )
      ) : activeTab === "images" ? (
        renderSection(
          locale.myFiles.filehub.sections.images,
          filteredAttachments
        )
      ) : (
        renderSection(
          locale.myFiles.filehub.sections.audio,
          filteredAttachments
        )
      )}

      {/* Upload modal: select or drag file */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {locale.myFiles.filehub.uploadModal.title}
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
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/60"
                  onClick={() => {
                    const input = document.getElementById(
                      "filehub-upload-input"
                    ) as HTMLInputElement | null;
                    input?.click();
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 mb-3">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {locale.myFiles.filehub.uploadModal.dragDrop}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {locale.myFiles.filehub.uploadModal.fileSizeHint}
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
                          {locale.myFiles.filehub.attachments.expires}{" "}
                          {expirationInput}
                        </span>
                      )}
                      {isGlobalFlag && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                          {locale.myFiles.filehub.attachments.global}
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
                    {locale.myFiles.filehub.uploadModal.preview}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMetadataModalOpen(true)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {locale.myFiles.filehub.uploadModal.editMetadata}
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
                    {locale.myFiles.filehub.uploadModal.remove}
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
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {locale.myFiles.filehub.uploadModal.uploading}{" "}
                  {uploadProgress}%
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
                {locale.myFiles.filehub.uploadModal.cancel}
              </button>
              <button
                type="button"
                onClick={handleUploadConfirm}
                disabled={!selectedFile || uploadStatus === "uploading"}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
              >
                {uploadStatus === "uploading"
                  ? locale.myFiles.filehub.uploadModal.uploading
                  : locale.myFiles.filehub.uploadModal.uploadFile}
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
                {locale.myFiles.filehub.metadataModal.title}
              </h4>
              {selectedFile && (
                <p className="mt-1 text-xs text-slate-500">
                  {selectedFile.name} •{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                {locale.myFiles.filehub.metadataModal.expirationLabel}
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
                    {locale.myFiles.filehub.metadataModal.globalLabel}
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
                      {locale.myFiles.filehub.metadataModal.no}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGlobalFlag(true)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        isGlobalFlag
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {locale.myFiles.filehub.metadataModal.yes}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {locale.myFiles.filehub.metadataModal.globalHint}
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
                {locale.myFiles.filehub.metadataModal.cancel}
              </button>
              <button
                type="button"
                onClick={() => setIsMetadataModalOpen(false)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
              >
                {locale.myFiles.filehub.metadataModal.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
