"use client";

import { useState } from "react";
import { Task } from "@/lib/api/tasks";
import CheckCircle from "@/icons/CheckCircle";
import Briefcase from "@/icons/Briefcase";
import Clock from "@/icons/Clock";
import api from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import TaskRejectionModal from "./TaskRejectionModal";
import Trash from "@/icons/Trash";
import Check from "@/icons/Check";
import X from "@/icons/X";
import { useTasksStore } from "../../store/useTasksStore";
import { useTaskDetailsStore } from "../store/useTaskDetailsStore";
import { useCurrentEditingTaskStore } from "../store/useCurrentEditingTaskStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import SquareArrow from "@/icons/SquareArrow";
import Pencil from "@/icons/Pencil";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";
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
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "";
};

export default function TaskCard({ task }: { task: Task }) {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { addToast } = useToastStore();
  const { openModal } = useConfirmationModalStore();
  const { updateTask, deleteTask } = useTasksStore();
  const { openDetails } = useTaskDetailsStore();
  const { setTask, setIsEditing } = useCurrentEditingTaskStore();
  const { getAttachments } = useAttachmentsStore();

  if (!locale) return null;

  const handleApprove = async () => {
    try {
      await api.TasksService.approveTask(task.id!).then((val) =>
        updateTask(val.id, val)
      );
      addToast({ message: locale.tasks.teamTasks.toasts.taskApproved, type: "success" });
    } catch {
      addToast({ message: locale.tasks.teamTasks.toasts.approveFailed, type: "error" });
    }
  };

  const handleDelete = async () => {
    openModal({
      title: locale.tasks.teamTasks.confirmations.deleteTitle,
      message: locale.tasks.teamTasks.confirmations.deleteMessage,
      onConfirm: async () => {
        try {
          await api.TasksService.deleteTask(task.id!);
          addToast({ message: locale.tasks.teamTasks.toasts.taskDeleted, type: "success" });
          deleteTask(task.id);
        } catch {
          addToast({ message: locale.tasks.teamTasks.toasts.deleteFailed, type: "error" });
        }
      },
    });
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-gray-200 w-full relative shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {task.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            </div>
          </div>
          <button
            onClick={handleDetailsClick}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={locale.tasks.teamTasks.card.actions.viewDetails}
          >
            <SquareArrow className="w-5 h-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
              task.status === "PENDING_REVIEW"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : task.status === "SEEN"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : task.status === "COMPLETED"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-50 text-gray-700 border border-gray-200"
            }`}
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
              task.priority === "HIGH"
                ? "bg-red-50 text-red-700 border border-red-200"
                : task.priority === "MEDIUM"
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {task.priority === "HIGH"
              ? locale?.tasks?.modals?.addTask?.priorityOptions?.high || "HIGH"
              : task.priority === "MEDIUM"
              ? locale?.tasks?.modals?.addTask?.priorityOptions?.medium || "MEDIUM"
              : locale?.tasks?.modals?.addTask?.priorityOptions?.low || "LOW"}
          </span>

          {getAttachments("task", task.id).length > 0 && (
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
              <PaperClipIcon className="w-3 h-3" />
              {getAttachments("task", task.id).length}{" "}
              {getAttachments("task", task.id).length !== 1
                ? locale.tasks.teamTasks.card.attachments
                : locale.tasks.teamTasks.card.attachment}
            </span>
          )}
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {locale.tasks.modals.addTask.fields.assignee}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {task.assignee?.user?.name ||
                    task.targetSubDepartment?.name ||
                    "Unassigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {locale.tasks.modals.addTask.fields.dueDate}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {task.dueDate
                    ? formatDateWithHijri(task.dueDate, language)
                    : locale.tasks.teamTasks.card.noDueDate}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {locale.tasks.teamTasks.card.lastUpdated}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDateWithHijri(task.updatedAt || new Date(), language)}
                </p>
              </div>
            </div>

            {task.reminderInterval && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {locale.tasks.modals.addTask.fields.reminder}
                </p>
                  <p className="text-sm font-semibold text-blue-600">
                    {locale.tasks.teamTasks.card.every}{" "}
                    {formatReminderInterval(task.reminderInterval)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              setTask(task);
              setIsEditing(true);
            }}
            className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={locale.tasks.teamTasks.card.actions.edit}
          >
            <Pencil className="w-4 h-4" />
          </button>

          {task.status !== "COMPLETED" &&
            task.status !== "TODO" &&
            task.status !== "SEEN" && (
              <>
                <button
                  onClick={handleApprove}
                  className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title={locale.tasks.teamTasks.card.actions.approve}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={locale.tasks.teamTasks.card.actions.reject}
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          <button
            onClick={handleDelete}
            className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={locale.tasks.teamTasks.card.actions.delete}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <TaskRejectionModal
        taskId={task.id}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        // onRejected={onUpdate}
      />
    </>
  );
}
