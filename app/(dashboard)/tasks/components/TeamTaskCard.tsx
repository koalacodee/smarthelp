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
import { useTaskSubmissionsStore } from "../store/useTaskSubmissionsStore";
import ThreeDotMenu from "./ThreeDotMenu";
import { useTaskStore } from "@/lib/store";

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

const getSubmissionStatusColor = (status: string) => {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-100 text-blue-800";
    case "APPROVED":
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
  const [isSubmissionsExpanded, setIsSubmissionsExpanded] = useState(false);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );
  const { openDetails } = useTaskDetailsStore();
  const { setTask, setIsEditing } = useCurrentEditingTaskStore();
  const { getAttachments } = useAttachmentsStore();
  const taskAttachmentIds = getAttachments("task", task.id);
  const { setMetadata } = useMediaMetadataStore();
  const { openPreview } = useMediaPreviewStore();
  const { updateTask, deleteTask } = useTaskStore();
  const { openModal } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { getTaskSubmissions, getSubmissionAttachments } =
    useTaskSubmissionsStore();
  const [taskAttachmentsMetadata, setTaskAttachmentsMetadata] = useState<{
    [attachmentId: string]: any;
  }>({});
  const [submissionAttachmentsMetadata, setSubmissionAttachmentsMetadata] =
    useState<{
      [attachmentId: string]: any;
    }>({});

  // Load attachment metadata for this task
  useEffect(() => {
    const loadAttachmentsMetadata = async () => {
      if (taskAttachmentIds.length > 0) {
        const attachmentMetadataPromises = taskAttachmentIds.map(
          async (attachmentId) => {
            try {
              const metadata = await FileService.getAttachmentMetadata(
                attachmentId
              );
              setMetadata(attachmentId, metadata);
              return { attachmentId, metadata };
            } catch (error) {
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
  }, [task.id, setMetadata, taskAttachmentIds.length]);

  // Load submission attachment metadata
  useEffect(() => {
    const loadSubmissionAttachmentsMetadata = async () => {
      const taskSubmissions = getTaskSubmissions(task.id);
      const allSubmissionAttachments: string[] = [];

      taskSubmissions.forEach((submission) => {
        const submissionAttachments = getSubmissionAttachments(submission.id);
        allSubmissionAttachments.push(...submissionAttachments);
      });

      if (allSubmissionAttachments.length > 0) {
        const attachmentMetadataPromises = allSubmissionAttachments.map(
          async (attachmentId) => {
            try {
              const metadata = await FileService.getAttachmentMetadata(
                attachmentId
              );
              setMetadata(attachmentId, metadata);
              return { attachmentId, metadata };
            } catch (error) {
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

        setSubmissionAttachmentsMetadata(attachmentMap);
      }
    };

    loadSubmissionAttachmentsMetadata();
  }, [
    task.id,
    getTaskSubmissions,
    getSubmissionAttachments,
    setMetadata,
    getTaskSubmissions(task.id).length,
  ]);

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
    const attachmentMetadata =
      taskAttachmentsMetadata[attachmentId] ||
      submissionAttachmentsMetadata[attachmentId];
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

  const taskAttachments = taskAttachmentIds;
  const taskSubmissions = getTaskSubmissions(task.id);

  const toggleSubmission = (submissionId: string) => {
    setExpandedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      await api.TasksService.approveTaskSubmission({
        taskSubmissionId: submissionId,
      });
      addToast({ message: "Submission approved", type: "success" });
      // Refresh the task data or update the submission status
    } catch (error) {
      addToast({ message: "Failed to approve submission", type: "error" });
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      await api.TasksService.rejectTaskSubmission({
        taskSubmissionId: submissionId,
      });
      addToast({ message: "Submission rejected", type: "success" });
      // Refresh the task data or update the submission status
    } catch (error) {
      addToast({ message: "Failed to reject submission", type: "error" });
    }
  };

  return (
    <>
      <div className="relative bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Priority colored line on the left */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(
            task.priority || "MEDIUM"
          )} rounded-l-2xl`}
        ></div>

        <div className="p-6 ml-2">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {task.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {task.description}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <ThreeDotMenu
                options={[
                  {
                    label: "Preview",
                    onClick: handlePreviewClick,
                    color: "blue",
                  },
                  {
                    label: "Edit",
                    onClick: () => {
                      setTask(task);
                      setIsEditing(true);
                    },
                    color: "blue",
                  },
                  {
                    label: "Delete",
                    onClick: handleDelete,
                    color: "red",
                  },
                ]}
              />
            </div>
          </div>

          {/* Tags and metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status || "TODO"
              )}`}
            >
              {task.status?.replace("_", " ") || "TODO"}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                task.priority === "HIGH"
                  ? "bg-red-100 text-red-800"
                  : task.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {task.priority || "MEDIUM"}
            </span>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
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

          {/* Assignee info */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <span className="font-medium">Assigned to:</span>
            <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
              {task.assignee?.user?.name ||
                task.targetSubDepartment?.name ||
                task.targetDepartment?.name ||
                "Unassigned"}
            </span>
          </div>

          {/* Attachments */}
          {taskAttachments.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mb-4">
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

          {/* Task Submissions */}
          {taskSubmissions.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mb-4">
              <button
                onClick={() => setIsSubmissionsExpanded(!isSubmissionsExpanded)}
                className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-1 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-3 h-3 transition-transform ${
                      isSubmissionsExpanded ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">
                    Submissions ({taskSubmissions.length})
                  </span>
                </div>
              </button>

              {isSubmissionsExpanded && (
                <div className="mt-2 space-y-2">
                  {taskSubmissions.map((submission) => {
                    const submissionAttachments = getSubmissionAttachments(
                      submission.id
                    );
                    const isExpanded = expandedSubmissions.has(submission.id);
                    const hasAttachments = submissionAttachments.length > 0;
                    const hasContent = submission.notes || hasAttachments;

                    return (
                      <div
                        key={submission.id}
                        className="bg-gray-25 rounded p-2 border-l border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">
                                {submission.performerName
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-900">
                              {submission.performerName}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              ({submission.performerType})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${getSubmissionStatusColor(
                                submission.status
                              )}`}
                            >
                              {submission.status}
                            </span>
                            {hasContent && (
                              <button
                                onClick={() => toggleSubmission(submission.id)}
                                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                              >
                                <svg
                                  className={`w-3 h-3 transition-transform ${
                                    isExpanded ? "rotate-90" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Three-dot menu */}
                            <ThreeDotMenu
                              options={[
                                {
                                  label: "Approve",
                                  onClick: () =>
                                    handleApproveSubmission(submission.id),
                                  color: "green",
                                },
                                {
                                  label: "Reject",
                                  onClick: () =>
                                    handleRejectSubmission(submission.id),
                                  color: "red",
                                },
                              ]}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400 pl-7">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>

                        {isExpanded && hasContent && (
                          <div className="mt-2 pl-7 space-y-2">
                            {submission.notes && (
                              <p className="text-xs text-gray-600">
                                {submission.notes}
                              </p>
                            )}

                            {hasAttachments && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <PaperClipIcon className="w-3 h-3" />
                                  <span>
                                    Attachments ({submissionAttachments.length})
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {submissionAttachments.map(
                                    (attachmentId, index) => {
                                      const attachmentMetadata =
                                        submissionAttachmentsMetadata[
                                          attachmentId
                                        ];
                                      const fileName =
                                        attachmentMetadata?.originalName ||
                                        `Attachment ${index + 1}`;
                                      const uploadDate =
                                        attachmentMetadata?.uploadDate ||
                                        new Date();

                                      return (
                                        <div
                                          key={attachmentId}
                                          className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                                          onClick={() =>
                                            handleAttachmentClick(attachmentId)
                                          }
                                        >
                                          <PaperClipIcon className="w-3 h-3 text-blue-500" />
                                          <span className="truncate text-blue-500 hover:text-blue-600 transition-colors">
                                            {fileName}
                                          </span>
                                          <Clock className="w-3 h-3 text-gray-400" />
                                          <span className="text-gray-400">
                                            {new Date(
                                              uploadDate
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </span>
                                          <button
                                            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAttachmentClick(
                                                attachmentId
                                              );
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
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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

      <TaskRejectionModal
        taskId={task.id}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
      />
    </>
  );
}
