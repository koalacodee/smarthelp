import { useAttachments } from "@/hooks/useAttachments";
import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Eye from "@/icons/Eye";
import Pencil from "@/icons/Pencil";
import Plus from "@/icons/Plus";
import X from "@/icons/X";
import RefreshCw from "@/icons/RefreshCw";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateDisplay as formatDateDisplayWithHijri } from "@/locales/dateFormatter";
import { DatePickerInput, Language } from "@/components/ui/hijri-datepicker";
import { isRTL } from "@/locales/isRTL";

type AttachmentInputV3Props = {
  targetId?: string;
  uploadKey?: string;
  uploadWhenKeyProvided?: boolean;
  onSelectedAttachmentsChange?: (attachmentIds: Set<string>) => void;
  onDeletedAttachmentsChange?: (attachmentIds: Set<string>) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onHasFilesToUpload?: (hasFiles: boolean) => void;
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

const toDateInputValue = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AttachmentInputV3({
  targetId,
  uploadKey,
  uploadWhenKeyProvided = false,
  onSelectedAttachmentsChange,
  onDeletedAttachmentsChange,
  onUploadStart,
  onUploadEnd,
  onHasFilesToUpload,
}: AttachmentInputV3Props) {
  const {
    attachmentsToDelete,
    attachmentsToUpload,
    selectedFormMyAttachments,
    existingAttachments,
    myAttachments,
    fetchMyAttachments,
    handleUploadAttachment,
    uploadAttachments,
    moveCurrentNewTargetSelectionsToExisting,
    setAttachmentToUploadExpirationAndGlobalFlag,
    selectFormMyAttachmentForTarget,
    deselectFormMyAttachment,
    deleteAttachmentFromExistingAttachments,
    restoreAttachmentFromExistingAttachments,
    removeAttachmentToUpload,
    getUploadProgress,
    isUploading,
  } = useAttachments(targetId);

  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);

  const [isMyAttachmentsFetched, setIsMyAttachmentsFetched] = useState(false);
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
  const [discardOnMetadataClose, setDiscardOnMetadataClose] = useState(false);
  const [
    currentlySelectingExpirationDate,
    setCurrentlySelectingExpirationDate,
  ] = useState<Date | null>(null);
  const [currentlySelectingGlobalFlag, setCurrentlySelectingGlobalFlag] =
    useState(false);
  const [currentAttachmentToUplodId, setCurrentAttachmentToUplodId] = useState<
    string | null
  >(null);
  const [isChooseFromMyFilesDialogOpen, setIsChooseFromMyFilesDialogOpen] =
    useState(false);
  const [myAttachmentsSelection, setMyAttachmentsSelection] = useState<
    Set<string>
  >(new Set());
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<{
    signedUrl?: string;
    originalName: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { openPreview } = useMediaPreviewStore();

  // Refs to track previous values and prevent infinite loops
  const prevSelectedIdsRef = useRef<string>("");
  const prevDeletedIdsRef = useRef<string>("");
  const onSelectedAttachmentsChangeRef = useRef(onSelectedAttachmentsChange);
  const onDeletedAttachmentsChangeRef = useRef(onDeletedAttachmentsChange);

  useEffect(() => {
    onHasFilesToUpload?.(attachmentsToUpload.length > 0);
  }, [attachmentsToUpload, onHasFilesToUpload]);

  // Keep refs in sync with latest callbacks
  useEffect(() => {
    onSelectedAttachmentsChangeRef.current = onSelectedAttachmentsChange;
  }, [onSelectedAttachmentsChange]);

  useEffect(() => {
    onDeletedAttachmentsChangeRef.current = onDeletedAttachmentsChange;
  }, [onDeletedAttachmentsChange]);

  const pendingUploads = attachmentsToUpload;
  const selectedFromMine = selectedFormMyAttachments;
  const existing = existingAttachments;
  const inputId =
    targetId !== undefined
      ? `attachment-upload-input-${targetId}`
      : "attachment-upload-input-new";

  const metadataAttachment = useMemo(
    () =>
      pendingUploads.find(
        (attachment) => attachment.id === currentAttachmentToUplodId
      ) || null,
    [pendingUploads, currentAttachmentToUplodId]
  );

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const id = handleUploadAttachment(files[0], false, null);
    setCurrentAttachmentToUplodId(id);
    setDiscardOnMetadataClose(true);
    setIsMetadataDialogOpen(true);
    e.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files?.length) {
      const file = event.dataTransfer.files[0];
      const id = handleUploadAttachment(file, false, null);
      setCurrentAttachmentToUplodId(id);
      setDiscardOnMetadataClose(true);
      setIsMetadataDialogOpen(true);
    }
  };

  const handleDrag = (
    event: React.DragEvent<HTMLDivElement>,
    over: boolean
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(over);
  };

  const openMetadataDialog = (attachmentId: string) => {
    setCurrentAttachmentToUplodId(attachmentId);
    setDiscardOnMetadataClose(false);
    setIsMetadataDialogOpen(true);
  };

  useEffect(() => {
    if (isMetadataDialogOpen && metadataAttachment) {
      setCurrentlySelectingExpirationDate(
        metadataAttachment.expirationDate ?? null
      );
      setCurrentlySelectingGlobalFlag(metadataAttachment.isGlobal);
    }
  }, [isMetadataDialogOpen, metadataAttachment]);

  useEffect(() => {
    const callback = onSelectedAttachmentsChangeRef.current;
    if (!callback) return;

    const currentIds = new Set(
      selectedFromMine.map((attachment) => attachment.id)
    );
    const currentIdsString = Array.from(currentIds).sort().join(",");

    // Only call callback if the Set actually changed
    if (currentIdsString !== prevSelectedIdsRef.current) {
      prevSelectedIdsRef.current = currentIdsString;
      callback(currentIds);
    }
  }, [selectedFromMine]);

  useEffect(() => {
    const callback = onDeletedAttachmentsChangeRef.current;
    if (!callback) return;

    const currentIds = new Set(
      attachmentsToDelete.map((attachment) => attachment.id)
    );
    const currentIdsString = Array.from(currentIds).sort().join(",");

    // Only call callback if the Set actually changed
    if (currentIdsString !== prevDeletedIdsRef.current) {
      prevDeletedIdsRef.current = currentIdsString;
      callback(currentIds);
    }
  }, [attachmentsToDelete]);

  const closeMetadataDialog = (
    shouldDiscard: boolean = discardOnMetadataClose
  ) => {
    if (shouldDiscard && currentAttachmentToUplodId) {
      removeAttachmentToUpload(currentAttachmentToUplodId);
    }
    setIsMetadataDialogOpen(false);
    setDiscardOnMetadataClose(false);
    setCurrentlySelectingExpirationDate(null);
    setCurrentlySelectingGlobalFlag(false);
    setCurrentAttachmentToUplodId(null);
  };

  const onMetadataConfirm = () => {
    if (!currentAttachmentToUplodId) return;
    setAttachmentToUploadExpirationAndGlobalFlag(
      currentAttachmentToUplodId,
      currentlySelectingExpirationDate,
      currentlySelectingGlobalFlag
    );
    // Explicitly close without discarding the attachment
    closeMetadataDialog(false);
  };

  useEffect(() => {
    // Ensure we only auto-upload once per uploadKey to avoid infinite loops
    // when parent components re-render and re-create callback props.
    const lastProcessedKeyRef = (AttachmentInputV3 as any)
      ._lastProcessedKeyRef as React.RefObject<string | null> | undefined;

    // Lazily initialize static ref on the component function
    if (!lastProcessedKeyRef) {
      (AttachmentInputV3 as any)._lastProcessedKeyRef = { current: null };
    }

    const ref = (AttachmentInputV3 as any)
      ._lastProcessedKeyRef as React.RefObject<string | null>;

    const shouldUpload =
      uploadWhenKeyProvided &&
      !!uploadKey &&
      ref.current !== uploadKey &&
      !isUploading;

    if (!shouldUpload) return;

    ref.current = uploadKey!;

    const upload = async () => {
      onUploadStart?.();
      try {
        await uploadAttachments(uploadKey!);
        // After successful upload, convert any "new target" selections into existing attachments.
        if (targetId) {
          moveCurrentNewTargetSelectionsToExisting(targetId);
        }
      } finally {
        onUploadEnd?.();
      }
    };

    upload();
  }, [
    uploadWhenKeyProvided,
    uploadKey,
    uploadAttachments,
    moveCurrentNewTargetSelectionsToExisting,
    targetId,
    isUploading,
    onUploadStart,
    onUploadEnd,
  ]);

  const onChooseFromMyFilesClick = async () => {
    if (!isMyAttachmentsFetched) {
      await fetchMyAttachments();
      setIsMyAttachmentsFetched(true);
    }
    setMyAttachmentsSelection(
      new Set(selectedFromMine.map((attachment) => attachment.id))
    );
    setIsChooseFromMyFilesDialogOpen(true);
  };

  const toggleMyAttachmentSelection = (attachmentId: string) => {
    setMyAttachmentsSelection((prev) => {
      const next = new Set(prev);
      if (next.has(attachmentId)) {
        next.delete(attachmentId);
      } else {
        next.add(attachmentId);
      }
      return next;
    });
  };

  const onChooseFromMyFilesConfirm = () => {
    const currentSelected = new Set(
      selectedFromMine.map((attachment) => attachment.id)
    );
    selectedFromMine.forEach((attachment) => {
      if (!myAttachmentsSelection.has(attachment.id)) {
        deselectFormMyAttachment(attachment.id);
      }
    });
    myAttachmentsSelection.forEach((attachmentId) => {
      if (!currentSelected.has(attachmentId)) {
        selectFormMyAttachmentForTarget(attachmentId);
      }
    });
    setIsChooseFromMyFilesDialogOpen(false);
  };

  const handlePreview = (attachment: {
    id: string;
    name: string;
    signedUrl?: string;
    objectUrl?: string;
    size: number;
    expirationDate?: string | Date | null;
    fileType?: string;
  }) => {
    if (attachment.signedUrl) {
      openPreview({
        originalName: attachment.name,
        tokenOrId: attachment.signedUrl,
        fileType: attachment.fileType,
        sizeInBytes: attachment.size,
        expiryDate:
          attachment.expirationDate instanceof Date
            ? attachment.expirationDate.toISOString()
            : attachment.expirationDate || undefined,
      });
    } else if (attachment.objectUrl) {
      // For pending uploads, use objectUrl (blob URL)
      const fileType =
        attachment.fileType || getFileTypeFromName(attachment.name);
      openPreview({
        originalName: attachment.name,
        tokenOrId: attachment.objectUrl,
        fileType: fileType,
        sizeInBytes: attachment.size,
        expiryDate:
          attachment.expirationDate instanceof Date
            ? attachment.expirationDate.toISOString()
            : attachment.expirationDate || undefined,
      });
    } else {
      setPreviewAttachment({
        signedUrl: undefined,
        originalName: attachment.name,
      });
      setPreviewDialogOpen(true);
    }
  };

  const getFileTypeFromName = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    if (!extension) return "unknown";

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(extension)
    ) {
      return "image";
    } else if (
      ["mp4", "webm", "ogg", "avi", "mov", "wmv", "flv"].includes(extension)
    ) {
      return "video";
    } else if (
      ["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(extension)
    ) {
      return "audio";
    } else if (["pdf"].includes(extension)) {
      return "pdf";
    }
    return extension;
  };

  const getFileTypeFromMimeType = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/pdf") return "pdf";
    return "unknown";
  };

  const getStatusStyle = (status?: string, progress?: number) => {
    if (status === "completed" || status === "uploaded") {
      return {
        badge: "bg-green-600 text-white",
        highlight: "from-green-100/70 via-transparent",
      };
    }
    if (status === "error") {
      return {
        badge: "bg-red-600 text-white",
        highlight: "from-red-100/70 via-transparent",
      };
    }
    if (status === "uploading" || progress !== undefined) {
      return {
        badge: "bg-blue-600 text-white",
        highlight: "from-blue-100/70 via-transparent",
      };
    }
    return {
      badge: "bg-slate-900/80 text-white",
      highlight: "from-slate-100/70 via-transparent",
    };
  };

  const renderAttachmentRow = (
    attachment: {
      id: string;
      name: string;
      size: number;
      expirationDate?: string | Date | null;
      isGlobal: boolean;
      signedUrl?: string;
      status?: string;
      progress?: number;
    },
    actions: ReactNode,
    showProgress?: boolean
  ) => {
    const statusStyle = getStatusStyle(attachment.status, attachment.progress);
    const progressValue = attachment.progress ?? 0;
    const statusLabel =
      attachment.status === "completed" || attachment.status === "uploaded"
        ? locale?.myFiles?.filehub?.attachments?.uploaded || "Uploaded"
        : attachment.status === "uploading" || attachment.progress !== undefined
        ? `${Math.round(progressValue)}%`
        : locale?.myFiles?.filehub?.attachments?.queued || "Queued";

    return (
      <div
        key={attachment.id}
        className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm transition hover:shadow-md"
      >
        <div
          className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${statusStyle.highlight}`}
          style={{
            width: `${Math.min(Math.max(progressValue, 8), 100)}%`,
          }}
        />
        {showProgress && (
          <div className="absolute left-4 top-3 z-20">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow ${statusStyle.badge}`}
            >
              {(attachment.status === "uploading" ||
                attachment.progress !== undefined) && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              )}
              {statusLabel}
            </span>
          </div>
        )}
        <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
            <DocumentDuplicate className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-1 text-sm">
            <p className="truncate text-base font-semibold text-slate-900">
              {attachment.name}
            </p>
            <div className="flex flex-wrap gap-x-4 text-xs text-slate-500">
              <span>{formatBytes(attachment.size)}</span>
              <span className="hidden sm:inline">•</span>
              <span>
                {formatDateDisplayWithHijri(
                  attachment.expirationDate,
                  language,
                  locale?.myFiles?.filehub?.attachments?.noExpiration ||
                    "No expiration"
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
              {attachment.expirationDate && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                  {locale?.myFiles?.filehub?.attachments?.expires || "Expires"}{" "}
                  {formatDateDisplayWithHijri(
                    attachment.expirationDate,
                    language,
                    locale?.myFiles?.filehub?.attachments?.noExpiration ||
                      "No expiration"
                  )}
                </span>
              )}
              {attachment.isGlobal && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                  {locale?.myFiles?.filehub?.attachments?.global || "Global"}
                </span>
              )}
            </div>
          </div>
          {showProgress && (
            <div className="w-full sm:w-40">
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    attachment.status === "error"
                      ? "bg-red-500"
                      : attachment.status === "completed" ||
                        attachment.status === "uploaded"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  } transition-all`}
                  style={{
                    width: `${Math.min(
                      attachment.status === "queued" ? 5 : progressValue,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-right text-xs font-semibold text-slate-500">
                {attachment.status === "completed" ||
                attachment.status === "uploaded"
                  ? "100%"
                  : `${Math.round(progressValue)}%`}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </div>
    );
  };

  const totalFilesCount =
    pendingUploads.length + selectedFromMine.length + existing.length;
  const totalSize = useMemo(() => {
    let size = 0;
    pendingUploads.forEach((att) => (size += att.size));
    selectedFromMine.forEach((att) => (size += att.size));
    existing.forEach((att) => (size += att.size));
    return size;
  }, [pendingUploads, selectedFromMine, existing]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-800">
          {locale?.myFiles?.filehub?.attachments?.label || "Attachments"}
        </label>
        <p className="text-xs text-slate-500 mt-1">
          {locale?.myFiles?.filehub?.attachments?.description ||
            "Drag and drop files here or click to browse. Max size per file: 100MB"}
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
              {locale?.myFiles?.filehub?.attachments?.dropFilesHere ||
                "Drop files here"}
            </p>
            <p className="text-xs text-slate-500">
              {locale?.myFiles?.filehub?.attachments?.orClickToBrowse ||
                "or click to browse files from your computer"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label
            htmlFor={inputId}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {locale?.myFiles?.filehub?.attachments?.selectFiles ||
              "Select files"}
          </label>
          <input
            id={inputId}
            type="file"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={onChooseFromMyFilesClick}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            {locale?.myFiles?.filehub?.attachments?.myFiles || "My Files"}
          </button>
        </div>
      </div>

      {totalFilesCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm">
          <div>
            <span className="font-semibold text-slate-800">
              {totalFilesCount}
            </span>{" "}
            {locale?.myFiles?.filehub?.attachments?.filesSelected
              ?.replace("{count}", totalFilesCount.toString())
              ?.replace("{plural}", totalFilesCount === 1 ? "" : "s") ||
              `${totalFilesCount} file${
                totalFilesCount === 1 ? "" : "s"
              } selected`}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Total size
            </span>
            <span className="font-semibold text-slate-700">
              {formatBytes(totalSize)}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {pendingUploads.length > 0 && (
          <div className="space-y-4">
            {pendingUploads.map((attachment) => {
              const fileType = attachment.file?.type
                ? getFileTypeFromMimeType(attachment.file.type)
                : getFileTypeFromName(attachment.filename);
              const progress = getUploadProgress(attachment.id);
              const status =
                attachment.status === "completed" || progress >= 100
                  ? "uploaded"
                  : attachment.status === "failed"
                  ? "error"
                  : progress > 0 || attachment.status === "uploading"
                  ? "uploading"
                  : "queued";
              const statusStyle = getStatusStyle(status, progress);

              return (
                <div
                  key={attachment.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm transition hover:shadow-md"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${statusStyle.highlight}`}
                    style={{
                      width:
                        status === "queued"
                          ? "8%"
                          : `${Math.min(Math.max(progress, 8), 100)}%`,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => removeAttachmentToUpload(attachment.id)}
                    className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1 text-slate-400 shadow hover:text-red-600"
                    aria-label={
                      locale?.myFiles?.filehub?.attachments?.removeFile ||
                      "Remove file"
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                      <DocumentDuplicate className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {attachment.filename}
                      </p>
                      <div className="flex flex-wrap gap-x-4 text-xs items-center text-slate-500">
                        <span>{formatBytes(attachment.size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {attachment.file?.type ||
                            locale?.myFiles?.filehub?.attachments
                              ?.unknownType ||
                            "Unknown type"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow ${statusStyle.badge}`}
                        >
                          {status === "uploading" && (
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                          )}
                          {status === "uploaded"
                            ? locale?.myFiles?.filehub?.attachments?.uploaded ||
                              "Uploaded"
                            : status === "uploading"
                            ? `${Math.round(progress)}%`
                            : locale?.myFiles?.filehub?.attachments?.queued ||
                              "Queued"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {attachment.expirationDate && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                            {locale?.myFiles?.filehub?.attachments?.expires ||
                              "Expires"}{" "}
                            {formatDateDisplayWithHijri(
                              attachment.expirationDate,
                              language,
                              locale?.myFiles?.filehub?.attachments
                                ?.noExpiration || "No expiration"
                            )}
                          </span>
                        )}
                        {attachment.isGlobal && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                            {locale?.myFiles?.filehub?.attachments?.global ||
                              "Global"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handlePreview({
                            id: attachment.id,
                            name: attachment.filename,
                            objectUrl: attachment.objectUrl,
                            size: attachment.size,
                            expirationDate: attachment.expirationDate ?? null,
                            fileType: fileType,
                          })
                        }
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title={
                          locale?.myFiles?.filehub?.attachments?.preview ||
                          "Preview"
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openMetadataDialog(attachment.id)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title={
                          locale?.myFiles?.filehub?.uploadModal?.editMetadata ||
                          "Edit Metadata"
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-full sm:w-40">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            status === "error"
                              ? "bg-red-500"
                              : status === "uploaded"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          } transition-all`}
                          style={{
                            width: `${Math.min(
                              status === "queued" ? 5 : progress,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-right text-xs font-semibold text-slate-500">
                        {status === "uploaded"
                          ? "100%"
                          : `${Math.round(progress)}%`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedFromMine.length > 0 && (
          <div className="space-y-4">
            {selectedFromMine.map((attachment) => {
              const statusStyle = getStatusStyle("uploaded");
              return (
                <div
                  key={attachment.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm transition hover:shadow-md"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${statusStyle.highlight}`}
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() => deselectFormMyAttachment(attachment.id)}
                    className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1 text-slate-400 shadow hover:text-red-600"
                    aria-label={
                      locale?.myFiles?.filehub?.attachments?.removeFile ||
                      "Remove file"
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                      <DocumentDuplicate className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {attachment.originalName ?? attachment.filename}
                      </p>
                      <div className="flex flex-wrap gap-x-4 text-xs text-slate-500">
                        <span>{formatBytes(attachment.size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {attachment.fileType ||
                            locale?.myFiles?.filehub?.attachments
                              ?.unknownType ||
                            "Unknown type"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {attachment.expirationDate && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                            {locale?.myFiles?.filehub?.attachments?.expires ||
                              "Expires"}{" "}
                            {formatDateDisplayWithHijri(
                              attachment.expirationDate,
                              language,
                              locale?.myFiles?.filehub?.attachments
                                ?.noExpiration || "No expiration"
                            )}
                          </span>
                        )}
                        {attachment.isGlobal && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                            {locale?.myFiles?.filehub?.attachments?.global ||
                              "Global"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handlePreview({
                            id: attachment.id,
                            name:
                              attachment.originalName ?? attachment.filename,
                            signedUrl: attachment.signedUrl,
                            size: attachment.size,
                            expirationDate: attachment.expirationDate ?? null,
                          })
                        }
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title={
                          locale?.myFiles?.filehub?.attachments?.preview ||
                          "Preview"
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {existing.length > 0 && targetId && (
          <div className="space-y-4">
            {existing.map((attachment) => {
              const statusStyle = getStatusStyle("uploaded");
              return (
                <div
                  key={attachment.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm transition hover:shadow-md"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${statusStyle.highlight}`}
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      deleteAttachmentFromExistingAttachments(
                        targetId,
                        attachment.id
                      )
                    }
                    className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1 text-slate-400 shadow hover:text-red-600"
                    aria-label={
                      locale?.myFiles?.filehub?.attachments?.removeFile ||
                      "Remove file"
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                      <DocumentDuplicate className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {attachment.originalName ?? attachment.filename}
                      </p>
                      <div className="flex flex-wrap gap-x-4 text-xs text-slate-500">
                        <span>{formatBytes(attachment.size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {attachment.fileType ||
                            locale?.myFiles?.filehub?.attachments
                              ?.unknownType ||
                            "Unknown type"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {attachment.expirationDate && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                            {locale?.myFiles?.filehub?.attachments?.expires ||
                              "Expires"}{" "}
                            {formatDateDisplayWithHijri(
                              attachment.expirationDate,
                              language,
                              locale?.myFiles?.filehub?.attachments
                                ?.noExpiration || "No expiration"
                            )}
                          </span>
                        )}
                        {attachment.isGlobal && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                            {locale?.myFiles?.filehub?.attachments?.global ||
                              "Global"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handlePreview({
                            id: attachment.id,
                            name:
                              attachment.originalName ?? attachment.filename,
                            signedUrl: attachment.signedUrl,
                            size: attachment.size,
                            expirationDate: attachment.expirationDate ?? null,
                          })
                        }
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title={
                          locale?.myFiles?.filehub?.attachments?.preview ||
                          "Preview"
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {attachmentsToDelete.length > 0 && (
          <div className="space-y-4">
            {attachmentsToDelete.map((attachment) => {
              const statusStyle = getStatusStyle("error");
              return (
                <div
                  key={attachment.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm transition hover:shadow-md"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${statusStyle.highlight}`}
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      restoreAttachmentFromExistingAttachments(attachment.id)
                    }
                    className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1 text-green-600 shadow hover:text-green-700"
                    aria-label={
                      locale?.myFiles?.filehub?.attachments?.restoreFile ||
                      "Restore file"
                    }
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                      <DocumentDuplicate className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {attachment.originalName ?? attachment.filename}
                      </p>
                      <div className="flex flex-wrap gap-x-4 text-xs items-center text-slate-500">
                        <span>{formatBytes(attachment.size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {attachment.fileType ||
                            locale?.myFiles?.filehub?.attachments
                              ?.unknownType ||
                            "Unknown type"}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow ${statusStyle.badge}`}
                        >
                          {locale?.myFiles?.filehub?.attachments
                            ?.markedForDeletion || "Marked for Deletion"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {attachment.expirationDate && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                            {locale?.myFiles?.filehub?.attachments?.expires ||
                              "Expires"}{" "}
                            {formatDateDisplayWithHijri(
                              attachment.expirationDate,
                              language,
                              locale?.myFiles?.filehub?.attachments
                                ?.noExpiration || "No expiration"
                            )}
                          </span>
                        )}
                        {attachment.isGlobal && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                            {locale?.myFiles?.filehub?.attachments?.global ||
                              "Global"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalFilesCount === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-400">
            No files selected yet.
          </div>
        )}
      </div>

      {isMetadataDialogOpen && metadataAttachment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4">
              <h4 className="text-base font-semibold text-slate-900">
                {locale?.myFiles?.filehub?.uploadModal?.editMetadata ||
                  "Edit Metadata"}
              </h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  {locale?.myFiles?.filehub?.attachments?.expirationDate ||
                    locale?.myFiles?.filehub?.metadataModal?.expirationLabel ||
                    "Expiration date"}
                </label>
                <DatePickerInput
                  defaultCalendar={language === "ar" ? "hijri" : "gregorian"}
                  defaultLanguage={language as Language}
                  onChange={(date) => {
                    setCurrentlySelectingExpirationDate(date);
                  }}
                  value={currentlySelectingExpirationDate || undefined}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {locale?.myFiles?.filehub?.attachments?.globalFlag ||
                      locale?.myFiles?.filehub?.metadataModal?.globalLabel ||
                      "Global flag"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentlySelectingGlobalFlag((prev) => !prev)
                  }
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
                    currentlySelectingGlobalFlag
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      currentlySelectingGlobalFlag
                        ? isRTL(language)
                          ? "-translate-x-6"
                          : "translate-x-6"
                        : isRTL(language)
                        ? "-translate-x-1"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => closeMetadataDialog()}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {locale?.myFiles?.filehub?.uploadModal?.cancel ||
                  locale?.myFiles?.filehub?.metadataModal?.cancel ||
                  "Cancel"}
              </button>
              <button
                type="button"
                onClick={onMetadataConfirm}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                {locale?.myFiles?.filehub?.attachments?.confirm ||
                  locale?.myFiles?.filehub?.metadataModal?.done ||
                  "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4">
              <h4 className="text-base font-semibold text-slate-900">
                {locale?.myFiles?.filehub?.attachments?.previewUnavailable ||
                  "Preview Unavailable"}
              </h4>
            </div>
            <div className="mb-6">
              <p className="text-sm text-slate-600">
                {locale?.myFiles?.filehub?.attachments
                  ?.previewUnavailableMessage ||
                  "Preview is not available for this attachment. The file may not have a signed URL or may not be accessible at this time."}
              </p>
              {previewAttachment && (
                <p className="text-sm text-slate-500 mt-2">
                  {locale?.myFiles?.filehub?.attachments?.file || "File"}:{" "}
                  {previewAttachment.originalName}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPreviewDialogOpen(false);
                  setPreviewAttachment(null);
                }}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                {locale?.myFiles?.filehub?.attachments?.close ||
                  locale?.myFiles?.filehub?.uploadModal?.cancel ||
                  "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isChooseFromMyFilesDialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div
            className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4">
              <h4 className="text-base font-semibold text-slate-900">
                {locale?.myFiles?.filehub?.attachments?.myAttachments ||
                  "My Attachments"}
              </h4>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
              {myAttachments.length ? (
                myAttachments.map((attachment) => (
                  <label
                    key={attachment.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-slate-300"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(attachment.size)} ·{" "}
                        {formatDateDisplayWithHijri(
                          attachment.expirationDate,
                          language,
                          locale?.myFiles?.filehub?.attachments?.noExpiration ||
                            "No expiration"
                        )}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={myAttachmentsSelection.has(attachment.id)}
                      onChange={() =>
                        toggleMyAttachmentSelection(attachment.id)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  {locale?.myFiles?.filehub?.attachments
                    ?.noAttachmentsAvailable || "No attachments available"}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsChooseFromMyFilesDialogOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {locale?.myFiles?.filehub?.uploadModal?.cancel ||
                  locale?.myFiles?.filehub?.metadataModal?.cancel ||
                  "Cancel"}
              </button>
              <button
                type="button"
                onClick={onChooseFromMyFilesConfirm}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                {locale?.myFiles?.filehub?.attachments?.addSelected ||
                  "Add Selected"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
