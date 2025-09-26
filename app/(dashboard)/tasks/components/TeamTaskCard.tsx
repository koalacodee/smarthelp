"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/api/tasks";
import Eye from "@/icons/Eye";
import Clock from "@/icons/Clock";
import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";
import { useTaskDetailsStore } from "../store/useTaskDetailsStore";
import { useCurrentEditingTaskStore } from "../store/useCurrentEditingTaskStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { useTasksStore } from "../../store/useTasksStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { FileService } from "@/lib/api";
import TaskRejectionModal from "./TaskRejectionModal";
import api from "@/lib/api";
import { useConfirmationModalStore } from "../../store/useConfirmationStore";

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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-yellow-500";
    case "LOW":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING_REVIEW":
      return "bg-blue-100 text-blue-800";
    case "SEEN":
      return "bg-amber-100 text-amber-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface TeamTaskCardProps {
  task: Task;
  userRole?: string;
}

export default function TeamTaskCard({ task, userRole }: TeamTaskCardProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { openDetails } = useTaskDetailsStore();
  const { setTask, setIsEditing } = useCurrentEditingTaskStore();
  const { getAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const { openPreview } = useMediaPreviewStore();
  const { updateTask, deleteTask } = useTasksStore();
  const { openModal } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const [taskAttachmentsMetadata, setTaskAttachmentsMetadata] = useState<{
    [attachmentId: string]: any;
  }>({});

  // Load attachment metadata for this task
  useEffect(() => {
    const loadAttachmentsMetadata = async () => {
      const taskAttachments = getAttachments("task", task.id);
      if (taskAttachments.length > 0) {
        const attachmentMetadataPromises = taskAttachments.map(
          async (attachmentId) => {
            try {
              const metadata = await FileService.getAttachmentMetadata(
                attachmentId
              );
              setMetadata(attachmentId, metadata);
              return { attachmentId, metadata };
            } catch (error) {
              console.error(
                `Failed to load metadata for attachment ${attachmentId}:`,
                error
              );
              return { attachmentId, metadata: null };
            }
          }
        );

        const results = await Promise.all(attachmentMetadataPromises);
        const attachmentMap = results.reduce(
          (acc, { attachmentId, metadata }) => {
            if (metadata) {
              acc[attachmentId] = metadata;
            }
            return acc;
          },
          {} as { [attachmentId: string]: any }
        );

        setTaskAttachmentsMetadata(attachmentMap);
      }
    };

    loadAttachmentsMetadata();
  }, [task.id, getAttachments, setMetadata]);

  const handleApprove = async () => {
    try {
      await api.TasksService.approveTask(task.id!).then((val) =>
        updateTask(val.id, val)
      );
      addToast({ message: "Task approved", type: "success" });
    } catch {
      addToast({ message: "Failed to approve task", type: "error" });
    }
  };

  const handleDelete = async () => {
    openModal({
      title: "Delete Task",
      message: "Are you sure you want to delete this task?",
      onConfirm: async () => {
        try {
          await api.TasksService.deleteTask(task.id!);
          addToast({ message: "Task deleted", type: "success" });
          deleteTask(task.id);
        } catch {
          addToast({ message: "Failed to delete task", type: "error" });
        }
      },
    });
  };

  const handlePreviewClick = () => {
    if (task.title && task.description && task.createdAt) {
      const taskAttachments = getAttachments("task", task.id);
      openDetails({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status || "",
        priority: task.priority || "",
        targetDepartment: task.targetDepartment,
        targetSubDepartment: task.targetSubDepartment,
        assignee: task.assignee,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt || "",
        notes: task.notes || "",
        attachments: taskAttachments,
        reminderInterval: task.reminderInterval,
      });
    }
  };

  const handleAttachmentClick = (attachmentId: string) => {
    const attachmentMetadata = taskAttachmentsMetadata[attachmentId];
    if (attachmentMetadata) {
      openPreview({
        originalName: attachmentMetadata.originalName,
        tokenOrId: attachmentId,
        fileType: attachmentMetadata.fileType,
        sizeInBytes: attachmentMetadata.sizeInBytes,
        expiryDate: attachmentMetadata.expiryDate,
      });
    }
  };

  const taskAttachments = getAttachments("task", task.id);

  return (
    <>
      <div className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Priority colored line on the left */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(
            task.priority || "MEDIUM"
          )} rounded-l-lg`}
        ></div>

        <div className="flex items-start gap-3 ml-2">
          {/* Task content */}
          <div className="flex-1 min-w-0">
            {/* Title and actions row */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                {task.title}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={handlePreviewClick}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Preview Task"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setTask(task);
                    setIsEditing(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Task"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Task"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mb-3">{task.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                  task.status || "TODO"
                )}`}
              >
                {task.status?.replace("_", " ") || "TODO"}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  task.priority === "HIGH"
                    ? "bg-red-100 text-red-800"
                    : task.priority === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {task.priority || "MEDIUM"}
              </span>
            </div>

            {/* Assignee and Due Date */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="font-medium">Assigned to:</span>
                <span>
                  {task.assignee?.user?.name ||
                    task.targetSubDepartment?.name ||
                    task.targetDepartment?.name ||
                    "Unassigned"}
                </span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    Due:{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Attachments */}
            {taskAttachments.length > 0 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="space-y-2">
                  {taskAttachments.map((attachmentId, index) => {
                    const attachmentMetadata =
                      taskAttachmentsMetadata[attachmentId];
                    const fileName =
                      attachmentMetadata?.originalName ||
                      `Attachment ${index + 1}`;
                    const uploadDate =
                      attachmentMetadata?.uploadDate || new Date();

                    return (
                      <div
                        key={attachmentId}
                        className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                        onClick={() => handleAttachmentClick(attachmentId)}
                      >
                        <PaperClipIcon className="w-3 h-3 text-blue-500" />
                        <span className="truncate text-blue-500 hover:text-blue-600 transition-colors">
                          {fileName}
                        </span>
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">
                          {new Date(uploadDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <button
                          className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttachmentClick(attachmentId);
                          }}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons for approval/rejection */}
            {task.status !== "COMPLETED" &&
              task.status !== "TODO" &&
              task.status !== "SEEN" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={handleApprove}
                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>

      <TaskRejectionModal
        taskId={task.id}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
      />
    </>
  );
}
