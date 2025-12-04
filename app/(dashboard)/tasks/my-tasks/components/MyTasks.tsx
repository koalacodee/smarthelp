"use client";
import { useEffect, useState, useMemo } from "react";
import { MyTasksResponse, UserResponse } from "@/lib/api";
import MyTasksDashboard from "./MyTasksDashboard";
import MyTasksFilters from "./MyTasksFilters";
import { useSubmitWorkModalStore } from "@/app/(dashboard)/store/useSubmitWorkModalStore";
import SubmitWorkModal from "../../components/SubmitWorkModal";
import { useTaskDetailsStore } from "../../store/useTaskDetailsStore";
import DetailedTaskCard from "../../components/DetailedTaskCard";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { useMyTasksStore } from "../store/useMyTasksStore";
import { FileService, TasksService } from "@/lib/api";
import Check from "@/icons/Check";
import Eye from "@/icons/Eye";
import Clock from "@/icons/Clock";
import ThreeDotMenu, { MenuOption } from "../../components/ThreeDotMenu";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { TaskStatus } from "@/lib/api/tasks";
import DelegationModal from "./DelegationModal";
import { TaskDelegationDTO } from "@/lib/api/v2/services/delegations";
import SubmitDelegationModal from "./SubmitDelegationModal";
import { useSubmitDelegationModalStore } from "@/app/(dashboard)/store/useSubmitDelegationModalStore";
import { FileHubAttachment } from "@/lib/api/v2/models/faq";
import { useAttachments } from "@/hooks/useAttachments";
import InlineAttachments from "../../components/InlineAttachments";

// Delegation icon component
const DelegationIcon = ({ className }: { className?: string }) => (
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
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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

const getDueDateStatus = (dueDate: string, status: string) => {
  if (status === "COMPLETED") {
    return (
      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
        Completed
      </span>
    );
  }

  const today = new Date();
  const due = new Date(dueDate);
  const formattedDate = due.toLocaleDateString("en-US", {
    month: "short", // Sep
    day: "numeric", // 4
    year: "numeric", // 2025
  });

  if (due < today) {
    return (
      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
        Due: {formattedDate} (Overdue)
      </span>
    );
  }

  return (
    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
      Due: {formattedDate} (Upcoming)
    </span>
  );
};

export default function MyTasks({ data }: { data: MyTasksResponse }) {
  const { openModal } = useSubmitWorkModalStore();
  const { openDetails } = useTaskDetailsStore();
  const { filteredTasks, total, metrics, setTasks } = useMyTasksStore();
  const { addToast } = useToastStore();
  const { openModal: openSubmitDelegationModal } =
    useSubmitDelegationModalStore();
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const { addExistingAttachmentToTarget, clearExistingAttachmentsForTarget } =
    useAttachments();
  // Initialize store with server data
  useEffect(() => {
    setTasks(data);
  }, [data, setTasks]);
  const [user, setUser] = useState<UserResponse>();

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (data.fileHubAttachments && data.fileHubAttachments.length > 0) {
      const allTargetIds = new Set<string>();

      data.fileHubAttachments?.forEach((attachment) => {
        allTargetIds.add(attachment.targetId);
      });

      allTargetIds.forEach((targetId) => {
        clearExistingAttachmentsForTarget(targetId);
      });
      data.fileHubAttachments.forEach((attachment: FileHubAttachment) => {
        if (!attachment?.targetId) return;
        addExistingAttachmentToTarget(attachment.targetId, {
          fileType: attachment.type,
          originalName: attachment.originalName,
          size: attachment.size,
          expirationDate: attachment.expirationDate,
          id: attachment.id,
          filename: attachment.filename,
          isGlobal: attachment.isGlobal,
          createdAt: attachment.createdAt,
          signedUrl: attachment.signedUrl,
        });
      });
    }
  }, [data.fileHubAttachments]);

  // Get delegations with tasks (filter out delegations without tasks)
  const delegations = useMemo(() => {
    if (!data.delegations) return [];
    return data.delegations.filter((delegation) => delegation.task);
  }, [data.delegations]);

  const onTaskClick = (task: (typeof filteredTasks)[0]) => {
    openModal(task);
  };

  const onDelegationClick = (delegation: TaskDelegationDTO) => {
    openSubmitDelegationModal(delegation);
  };

  const handlePreviewClick = (task: (typeof filteredTasks)[0]) => {
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

  const handleMarkAsSeen = async (taskId: string) => {
    try {
      await TasksService.markTaskAsSeen(taskId);
      addToast({ message: "Task marked as seen", type: "success" });
      // Optimistically update store to reflect new status and reapply filters/metrics
      useMyTasksStore
        .getState()
        .updateTask(taskId, { status: TaskStatus.SEEN });
    } catch (error) {
      addToast({ message: "Failed to mark task as seen", type: "error" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-5 max-w-[1400px] mx-auto">
      {/* Left Column - Dashboard and Filters */}
      <div className="space-y-5">
        {/* Dashboard */}
        <MyTasksDashboard total={total} {...metrics} />

        {/* Filters */}
        <MyTasksFilters />
      </div>

      {/* Right Column - Tasks and Delegations List */}
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
        <div className="space-y-0">
          {/* Render Tasks */}
          {filteredTasks && filteredTasks.length > 0 && (
            <>
              {filteredTasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Priority colored line on the left */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(
                        task.priority || "MEDIUM"
                      )} rounded-l-lg`}
                    ></div>

                    <div className="flex items-start gap-3 ml-2">
                      {/* Checkbox */}
                      <button
                        onClick={() => onTaskClick(task)}
                        className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-blue-500 transition-colors flex-shrink-0 mt-0.5"
                      >
                        {task.status === "COMPLETED" && (
                          <Check className="w-3 h-3 text-blue-600" />
                        )}
                      </button>

                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        {/* Title and actions row */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePreviewClick(task)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Preview Task"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <ThreeDotMenu
                              options={
                                [
                                  {
                                    label: "Mark As Seen",
                                    onClick: () =>
                                      handleMarkAsSeen(String(task.id)),
                                    color: "blue",
                                  },
                                  user?.role == "SUPERVISOR"
                                    ? {
                                        label:
                                          "Assign to Employee/Sub-Department",
                                        onClick: () => {
                                          setTaskId(String(task.id));
                                          setIsDelegationModalOpen(true);
                                        },
                                        color: "green",
                                      }
                                    : null,
                                ].filter(Boolean) as MenuOption[]
                              }
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mb-3">
                          {task.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              task.status === "PENDING_REVIEW"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "SEEN"
                                ? "bg-amber-100 text-amber-800"
                                : task.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
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
                            {task.priority}
                          </span>
                        </div>

                        {/* Due date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <Clock className="w-3 h-3" />
                            <span>
                              Starts:{" "}
                              {new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                        )}

                        <InlineAttachments targetId={task.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Render Delegations */}
          {delegations && delegations.length > 0 && (
            <>
              {delegations.map((delegation) => {
                const task = delegation.task!;
                const delegationId = String(delegation.id);

                return (
                  <div
                    key={delegationId}
                    className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Priority colored line on the left */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(
                        task.priority || "MEDIUM"
                      )} rounded-l-lg`}
                    ></div>

                    <div className="flex items-start gap-3 ml-2">
                      {/* Checkbox */}
                      <button
                        onClick={() => onDelegationClick(delegation)}
                        className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-purple-500 transition-colors flex-shrink-0 mt-0.5"
                      >
                        {task.status === "COMPLETED" && (
                          <Check className="w-3 h-3 text-purple-600" />
                        )}
                      </button>

                      {/* Delegation content */}
                      <div className="flex-1 min-w-0">
                        {/* Title and actions row */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-1">
                            <ThreeDotMenu
                              options={[
                                {
                                  label: "Submit for Review",
                                  onClick: () => onDelegationClick(delegation),
                                  color: "blue",
                                },
                              ]}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mb-3">
                          {task.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                            <DelegationIcon className="w-3 h-3" />
                            Delegated
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              task.status === "PENDING_REVIEW"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "SEEN"
                                ? "bg-amber-100 text-amber-800"
                                : task.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
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
                            {task.priority}
                          </span>
                        </div>

                        {/* Due date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <Clock className="w-3 h-3" />
                            <span>
                              Starts:{" "}
                              {new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                        )}

                        <InlineAttachments targetId={delegationId} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Empty state */}
          {(!filteredTasks || filteredTasks.length === 0) &&
            (!delegations || delegations.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found
              </div>
            )}
        </div>
      </div>

      <SubmitWorkModal />
      <DetailedTaskCard />
      <DelegationModal
        isOpen={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
        taskId={taskId || ""}
      />
      <SubmitDelegationModal />
    </div>
  );
}
