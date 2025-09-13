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
import SquareArrow from "@/icons/SquareArrow";

export default function TaskCard({ task }: { task: Task }) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { addToast } = useToastStore();
  const { openModal } = useConfirmationModalStore();
  const { updateTask, deleteTask } = useTasksStore();
  const { openDetails } = useTaskDetailsStore();

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

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow w-full relative">
        {/* Title + Badges */}
        <div className="flex flex-col justify-between items-start gap-3 mb-4">
          {/* Title */}
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground truncate w-[60%]">
              {task.title}
            </h3>
            <button
              onClick={handleDetailsClick}
              className="absolute top-0.5 right-0.5 text-muted-foreground hover:text-primary transition-colors"
              title="View details"
            >
              <SquareArrow className="w-5 h-5" />
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                task.status === "PENDING_REVIEW"
                  ? "bg-blue-100 text-blue-800"
                  : task.status === "SEEN"
                  ? "bg-amber-100 text-amber-800"
                  : task.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {task?.status?.replace("_", " ") || "TODO"}
            </span>

            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 min-w-[160px]">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="font-medium">
                  {task.assignee?.user?.name ||
                    task.targetSubDepartment?.name ||
                    "Unassigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-[160px]">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(task.updatedAt || new Date()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {task.status !== "COMPLETED" &&
            task.status !== "TODO" &&
            task.status !== "SEEN" && (
              <>
                <button
                  onClick={handleApprove}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete"
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
