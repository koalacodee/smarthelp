import { useTaskDetailsStore } from "../store/useTaskDetailsStore";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { FileService } from "@/lib/api";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
// Custom PaperClip icon component
const PaperClipIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
    />
  </svg>
);

// Helper function to convert milliseconds to readable format
const formatReminderInterval = (milliseconds?: number): string => {
  if (!milliseconds || milliseconds <= 0) return "";

  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

  return parts.length > 0 ? parts.join(", ") : "";
};

export default function DetailedTaskCard() {
  const { isOpen, currentTask, closeDetails } = useTaskDetailsStore();
  const { openPreview } = useMediaPreviewStore();
  const { getAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const [attachments, setAttachments] = useState<{ [id: string]: any }>({});

  useEffect(() => {
    if (currentTask?.id) {
      const taskAttachments = getAttachments("task", currentTask.id);
      if (taskAttachments.length > 0) {
        // Load attachment metadata
        const loadMetadata = async () => {
          const metadataPromises = taskAttachments.map(async (attachmentId) => {
            try {
              const metadata = await FileService.getAttachmentMetadata(
                attachmentId
              );
              setMetadata(attachmentId, metadata);
              return { id: attachmentId, metadata };
            } catch (error) {
              console.error(
                `Failed to load metadata for attachment ${attachmentId}:`,
                error
              );
              return { id: attachmentId, metadata: null };
            }
          });

          const results = await Promise.all(metadataPromises);
          const attachmentMap = results.reduce((acc, { id, metadata }) => {
            if (metadata) {
              acc[id] = metadata;
            }
            return acc;
          }, {} as { [id: string]: any });

          setAttachments(attachmentMap);
        };

        loadMetadata();
      }
    }
  }, [currentTask?.id, getAttachments, setMetadata]);

  const handleAttachmentClick = (attachmentId: string) => {
    const metadata = attachments[attachmentId];
    if (metadata) {
      openPreview({
        originalName: metadata.originalName,
        tokenOrId: attachmentId,
        fileType: metadata.fileType,
        sizeInBytes: metadata.sizeInBytes,
        expiryDate: metadata.expiryDate,
      });
    }
  };

  if (!currentTask) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={closeDetails}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentTask.title}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Description
                      </h3>
                      <p className="text-foreground">
                        {currentTask.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Status
                      </h3>
                      <p className="text-foreground">{currentTask.status}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Priority
                      </h3>
                      <p className="text-foreground">{currentTask.priority}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Due Date
                      </h3>
                      <p className="text-foreground">
                        {currentTask.dueDate
                          ? new Date(currentTask.dueDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>

                    {currentTask.reminderInterval && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Reminder Interval
                        </h3>
                        <p className="text-blue-600 font-medium">
                          Every{" "}
                          {formatReminderInterval(currentTask.reminderInterval)}
                        </p>
                      </div>
                    )}

                    {currentTask.targetDepartment && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Department
                        </h3>
                        <p className="text-foreground">
                          {currentTask.targetDepartment.name}
                        </p>
                      </div>
                    )}

                    {currentTask.targetSubDepartment && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Sub-Department
                        </h3>
                        <p className="text-foreground">
                          {currentTask.targetSubDepartment.name}
                        </p>
                      </div>
                    )}

                    {currentTask.assignee && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Assignee
                        </h3>
                        <p className="text-foreground">
                          {currentTask.assignee.user.name}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Created At
                      </h3>
                      <p className="text-foreground">
                        {new Date(currentTask.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {currentTask.notes && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Notes
                        </h3>
                        <p className="text-foreground">{currentTask.notes}</p>
                      </div>
                    )}

                    {Object.keys(attachments).length > 0 && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Attachments
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(attachments).map(
                            ([attachmentId, metadata]) => (
                              <div
                                key={attachmentId}
                                onClick={() =>
                                  handleAttachmentClick(attachmentId)
                                }
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                              >
                                <PaperClipIcon className="w-5 h-5 text-slate-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {metadata.originalName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {metadata.fileType} •{" "}
                                    {metadata.sizeInBytes
                                      ? `${(
                                          metadata.sizeInBytes / 1024
                                        ).toFixed(1)} KB`
                                      : "Unknown size"}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={closeDetails}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
