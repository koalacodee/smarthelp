"use client";

import { useState } from "react";
import { Task } from "@/lib/api/tasks";
import Clock from "@/icons/Clock";
import { useTaskDetailsStore } from "../store/useTaskDetailsStore";
import { useCurrentEditingTaskStore } from "../store/useCurrentEditingTaskStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import TaskRejectionModal from "./TaskRejectionModal";
import api from "@/lib/api";
import { useConfirmationModalStore } from "../../store/useConfirmationStore";
import { useTaskSubmissionsStore } from "../store/useTaskSubmissionsStore";
import ThreeDotMenu from "./ThreeDotMenu";
import { useTaskStore } from "@/lib/store";
import InlineAttachments from "./InlineAttachments";
import { useTaskSubmissionModalStore } from "../store/useTaskSubmissionModalStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateTimeWithHijri } from "@/locales/dateFormatter";

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
}

export default function TeamTaskCard({ task }: TeamTaskCardProps) {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSubmissionsExpanded, setIsSubmissionsExpanded] = useState(false);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );
  const { openDetails } = useTaskDetailsStore();
  const { setTask, setIsEditing } = useCurrentEditingTaskStore();
  const { updateTask, deleteTask } = useTaskStore();
  const { openModal } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const {
    getTaskSubmissions,
    getDelegationSubmissions,
    getSubmissionAttachments,
  } = useTaskSubmissionsStore();
  const { openApprovalModal, openRejectionModal } =
    useTaskSubmissionModalStore();

  if (!locale) return null;

  const handleApprove = async () => {
    try {
      await api.TasksService.approveTask(task.id!).then((val) =>
        updateTask(val.id, val)
      );
      addToast({
        message: locale.tasks.teamTasks.toasts.taskApproved,
        type: "success",
      });
    } catch {
      addToast({
        message: locale.tasks.teamTasks.toasts.approveFailed,
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    openModal({
      title: locale.tasks.teamTasks.confirmations.deleteTitle,
      message: locale.tasks.teamTasks.confirmations.deleteMessage,
      onConfirm: async () => {
        try {
          await api.TasksService.deleteTask(task.id!);
          addToast({
            message: locale.tasks.teamTasks.toasts.taskDeleted,
            type: "success",
          });
          deleteTask(task.id);
        } catch {
          addToast({
            message: locale.tasks.teamTasks.toasts.deleteFailed,
            type: "error",
          });
        }
      },
    });
  };

  const handlePreviewClick = () => {
    if (task.title && task.description && task.createdAt) {
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
        reminderInterval: task.reminderInterval,
      });
    }
  };

  const taskSubmissions = getTaskSubmissions(task.id);
  const delegationSubmissions = getDelegationSubmissions(task.id);
  const allSubmissionsCount =
    taskSubmissions.length + delegationSubmissions.length;

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

  const handleApproveSubmission = (submissionId: string) => {
    openApprovalModal(submissionId);
  };

  const handleRejectSubmission = (submissionId: string) => {
    openRejectionModal(submissionId);
  };

  return (
    <>
      <div className="relative bg-white/90  border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
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
                    label: locale.tasks.teamTasks.card.actions.viewDetails,
                    onClick: handlePreviewClick,
                    color: "blue",
                  },
                  {
                    label: locale.tasks.teamTasks.card.actions.edit,
                    onClick: () => {
                      setTask(task);
                      setIsEditing(true);
                    },
                    color: "blue",
                  },
                  {
                    label: locale.tasks.teamTasks.card.actions.delete,
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
              {task.status === "PENDING_REVIEW"
                ? locale.tasks.teamTasks.card.status.pendingReview
                : task.status === "SEEN"
                ? locale.tasks.teamTasks.card.status.seen
                : task.status === "COMPLETED"
                ? locale.tasks.teamTasks.card.status.completed
                : locale.tasks.teamTasks.card.status.todo}
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
              {task.priority === "HIGH"
                ? locale?.tasks?.modals?.addTask?.priorityOptions?.high || "HIGH"
                : task.priority === "MEDIUM"
                ? locale?.tasks?.modals?.addTask?.priorityOptions?.medium || "MEDIUM"
                : locale?.tasks?.modals?.addTask?.priorityOptions?.low || "LOW"}
            </span>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>
                  {locale.tasks.teamTasks.card.dueDate}{" "}
                  {formatDateTimeWithHijri(
                    task.dueDate,
                    language,
                    { month: "short", day: "numeric" },
                    { hour: "numeric", minute: "2-digit", hour12: true }
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Assignee info */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <span className="font-medium">
              {locale.tasks.teamTasks.card.assignedTo}
            </span>
            <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
              {task.assignee?.user?.name ||
                task.targetSubDepartment?.name ||
                task.targetDepartment?.name ||
                locale.tasks.teamTasks.card.unassigned}
            </span>
          </div>

          <InlineAttachments targetId={task.id} />

          {/* Task Submissions and Delegation Submissions */}
          {allSubmissionsCount > 0 && (
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
                    {locale.tasks.teamTasks.card.submissions} (
                    {allSubmissionsCount})
                  </span>
                </div>
              </button>

              {isSubmissionsExpanded && (
                <div className="mt-2 space-y-2">
                  {/* Render Task Submissions */}
                  {taskSubmissions.map((submission) => {
                    const isExpanded = expandedSubmissions.has(submission.id);
                    const hasContent = Boolean(submission.notes);

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
                            {submission.status !== "APPROVED" &&
                              submission.status !== "REJECTED" && (
                                <ThreeDotMenu
                                  options={[
                                    {
                                      label:
                                        locale.tasks.teamTasks.card.actions
                                          .approve,
                                      onClick: () =>
                                        handleApproveSubmission(submission.id),
                                      color: "green",
                                    },
                                    {
                                      label:
                                        locale.tasks.teamTasks.card.actions
                                          .reject,
                                      onClick: () =>
                                        handleRejectSubmission(submission.id),
                                      color: "red",
                                    },
                                  ]}
                                />
                              )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400 pl-7">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDateTimeWithHijri(
                              submission.submittedAt,
                              language,
                              { month: "short", day: "numeric" },
                              { hour: "numeric", minute: "2-digit", hour12: true }
                            )}
                          </span>
                        </div>

                        {isExpanded && hasContent && (
                          <div className="mt-2 pl-7 space-y-2">
                            {submission.notes && (
                              <p className="text-xs text-gray-600">
                                {submission.notes}
                              </p>
                            )}

                            <InlineAttachments targetId={submission.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Render Delegation Submissions */}
                  {delegationSubmissions.map((submission) => {
                    const submissionAttachments = getSubmissionAttachments(
                      submission.id.toString()
                    );
                    const isExpanded = expandedSubmissions.has(
                      submission.id.toString()
                    );
                    const hasAttachments = submissionAttachments.length > 0;
                    const hasContent = submission.notes || hasAttachments;

                    return (
                      <div
                        key={submission.id.toString()}
                        className="bg-purple-25 rounded p-2 border-l-2 border-purple-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-purple-600">
                                {submission.performerName
                                  ? submission.performerName
                                      .charAt(0)
                                      .toUpperCase()
                                  : submission.performerType
                                      .charAt(0)
                                      .toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-900">
                              {submission.performerName ||
                                submission.performerType}
                            </span>
                            <span className="text-xs text-purple-600 capitalize">
                              (Delegation)
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
                                onClick={() =>
                                  toggleSubmission(submission.id.toString())
                                }
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
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400 pl-7">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDateTimeWithHijri(
                              submission.submittedAt,
                              language,
                              { month: "short", day: "numeric" },
                              { hour: "numeric", minute: "2-digit", hour12: true }
                            )}
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
                              <InlineAttachments
                                targetId={submission.id as string}
                              />
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

          {/* Action buttons for approval/rejection
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
            )} */}
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
