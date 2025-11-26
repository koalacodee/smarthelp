import { useAttachments } from "@/hooks/useAttachments";
import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const formatDateDisplay = (date?: string | Date | null) => {
  if (!date) return "No expiration";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "No expiration";
  return parsed.toLocaleDateString();
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
    removeAttachmentToUpload,
    getUploadProgress,
    isUploading,
  } = useAttachments(targetId);

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
    const upload = async () => {
      if (isUploading) return;
      onUploadStart?.();
      if (uploadWhenKeyProvided && uploadKey) {
        await uploadAttachments(uploadKey);
        onUploadEnd?.();
        // After successful upload, convert any "new target" selections into existing attachments.
        if (targetId) {
          moveCurrentNewTargetSelectionsToExisting(targetId);
        }
      }
    };
    upload();
  }, [
    uploadWhenKeyProvided,
    uploadKey,
    uploadAttachments,
    moveCurrentNewTargetSelectionsToExisting,
    targetId,
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

  const renderAttachmentRow = (
    attachment: {
      id: string;
      name: string;
      size: number;
      expirationDate?: string | Date | null;
      isGlobal: boolean;
    },
    actions: ReactNode,
    description: string
  ) => (
    <li
      key={attachment.id}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
    >
      <div className="flex flex-col">
        <span className="font-medium text-slate-900">{attachment.name}</span>
        <span className="text-slate-500">{description}</span>
        <span className="text-xs text-slate-500">
          {formatBytes(attachment.size)} ·{" "}
          {formatDateDisplay(attachment.expirationDate)} ·
          {attachment.isGlobal ? " Global" : " Target-only"}
        </span>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </li>
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Attachment Input
          </h2>
          <p className="text-sm text-slate-500">
            Upload new files, reuse attachments you already own, and keep the
            parent informed about every change.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor={inputId}
            className="cursor-pointer rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            title="File input – select a file to upload and configure metadata."
          >
            Upload New File
          </label>
          <input
            id={inputId}
            type="file"
            className="sr-only"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={onChooseFromMyFilesClick}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Choose From My Attachments
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Pending Uploads
          </h3>
          <p className="text-xs text-slate-500">
            These files wait for metadata confirmation and background uploads.
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {pendingUploads.length ? (
              pendingUploads.map((attachment) =>
                renderAttachmentRow(
                  {
                    id: attachment.id,
                    name: attachment.filename,
                    size: attachment.size,
                    expirationDate: attachment.expirationDate ?? null,
                    isGlobal: attachment.isGlobal,
                  },
                  <>
                    <button
                      type="button"
                      onClick={() => openMetadataDialog(attachment.id)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 transition hover:border-slate-300"
                    >
                      Edit Metadata
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAttachmentToUpload(attachment.id)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 transition hover:bg-rose-50"
                    >
                      Remove
                    </button>
                    <span className="text-xs text-slate-500">
                      {attachment.status === "completed"
                        ? "Uploaded"
                        : `${Math.round(getUploadProgress(attachment.id))}%`}
                    </span>
                  </>,
                  "File input → pending upload tracking."
                )
              )
            ) : (
              <li className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                File input → waiting for an upload.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Selected From My Attachments
          </h3>
          <p className="text-xs text-slate-500">
            My attachments dialog → chosen items ready to link to this target.
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {selectedFromMine.length ? (
              selectedFromMine.map((attachment) =>
                renderAttachmentRow(
                  {
                    id: attachment.id,
                    name: attachment.originalName ?? attachment.filename,
                    size: attachment.size,
                    expirationDate: attachment.expirationDate ?? null,
                    isGlobal: attachment.isGlobal,
                  },
                  <button
                    type="button"
                    onClick={() => deselectFormMyAttachment(attachment.id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 transition hover:border-slate-300"
                  >
                    Remove Selection
                  </button>,
                  "My attachments dialog → confirmed selection."
                )
              )
            ) : (
              <li className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                My attachments dialog → no selections yet.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Existing Attachments
          </h3>
          <p className="text-xs text-slate-500">
            Existing cards → represent files already attached; mark for deletion
            if needed.
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {existing.length && targetId ? (
              existing.map((attachment) =>
                renderAttachmentRow(
                  {
                    id: attachment.id,
                    name: attachment.originalName ?? attachment.filename,
                    size: attachment.size,
                    expirationDate: attachment.expirationDate ?? null,
                    isGlobal: attachment.isGlobal,
                  },
                  <button
                    type="button"
                    onClick={() =>
                      deleteAttachmentFromExistingAttachments(
                        targetId,
                        attachment.id
                      )
                    }
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 transition hover:bg-rose-50"
                  >
                    Mark Delete
                  </button>,
                  "Existing attachment card → currently linked to target."
                )
              )
            ) : (
              <li className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                Existing attachment card → nothing attached yet.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Marked For Deletion
          </h3>
          <p className="text-xs text-slate-500">
            Deletion tracker → informs the parent via callback about removed
            files.
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {attachmentsToDelete.length ? (
              attachmentsToDelete.map((attachment) =>
                renderAttachmentRow(
                  {
                    id: attachment.id,
                    name: attachment.originalName ?? attachment.filename,
                    size: attachment.size,
                    expirationDate: attachment.expirationDate ?? null,
                    isGlobal: attachment.isGlobal,
                  },
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    Pending Removal
                  </span>,
                  "Deletion tracker → will remove on save."
                )
              )
            ) : (
              <li className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                Deletion tracker → no files flagged.
              </li>
            )}
          </ul>
        </div>
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
                Metadata dialog → finalize before upload
              </h4>
              <p className="text-sm text-slate-500">
                Set expiration and visibility so uploads carry accurate
                metadata.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  Expiration date
                </label>
                <input
                  type="date"
                  value={toDateInputValue(currentlySelectingExpirationDate)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCurrentlySelectingExpirationDate(
                      value ? new Date(`${value}T00:00:00`) : null
                    );
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Global flag
                  </p>
                  <p className="text-xs text-slate-500">
                    Global flag toggle → makes the attachment visible beyond
                    this target.
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
                        ? "translate-x-6"
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
                Cancel
              </button>
              <button
                type="button"
                onClick={onMetadataConfirm}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Confirm Metadata
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isChooseFromMyFilesDialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div
            className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4">
              <h4 className="text-base font-semibold text-slate-900">
                My attachments dialog → select reusable files
              </h4>
              <p className="text-sm text-slate-500">
                Toggle the checkboxes below to decide which personal attachments
                should link to this target.
              </p>
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
                        {formatDateDisplay(attachment.expirationDate)}
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
                  You have no personal attachments yet.
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsChooseFromMyFilesDialogOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onChooseFromMyFilesConfirm}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Add Selected Files
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
