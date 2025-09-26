"use client";
import { useEffect, useState } from "react";
import { MyTasksResponse } from "@/lib/api";
import MyTasksDashboard from "./MyTasksDashboard";
import MyTasksFilters from "./MyTasksFilters";
import MyTasksActions from "./MyTasksActions";
import { useSubmitWorkModalStore } from "@/app/(dashboard)/store/useSubmitWorkModalStore";
import SubmitWorkModal from "../../components/SubmitWorkModal";
import { useTaskDetailsStore } from "../../store/useTaskDetailsStore";
import DetailedTaskCard from "../../components/DetailedTaskCard";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { FileService } from "@/lib/api";
import Check from "@/icons/Check";
import Eye from "@/icons/Eye";
import Clock from "@/icons/Clock";

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
  const { getAttachments } = useAttachmentsStore();
  const { setTaskAttachments } = useTaskAttachments();
  const { setMetadata, getMetadata } = useMediaMetadataStore();
  const { openPreview } = useMediaPreviewStore();
  const [taskAttachmentsMetadata, setTaskAttachmentsMetadata] = useState<{
    [taskId: string]: { [attachmentId: string]: any };
  }>({});

  // Store attachments from the response
  useEffect(() => {
    if (data.attachments) {
      setTaskAttachments(data.attachments);
    }
  }, [data.attachments]);

  // Load attachment metadata for all tasks
  useEffect(() => {
    const loadAllAttachmentsMetadata = async () => {
      const metadataPromises = data.data.map(async (task) => {
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

          return { taskId: task.id, attachments: attachmentMap };
        }
        return { taskId: task.id, attachments: {} };
      });

      const results = await Promise.all(metadataPromises);
      const taskAttachmentsMap = results.reduce(
        (acc, { taskId, attachments }) => {
          acc[taskId] = attachments;
          return acc;
        },
        {} as { [taskId: string]: { [attachmentId: string]: any } }
      );

      setTaskAttachmentsMetadata(taskAttachmentsMap);
    };

    loadAllAttachmentsMetadata();
  }, [data.data, getAttachments, setMetadata]);

  const onTaskClick = (task: (typeof data.data)[0]) => {
    openModal(task);
  };

  const handlePreviewClick = (task: (typeof data.data)[0]) => {
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
      });
    }
  };

  const handleAttachmentClick = (attachmentId: string, taskId: string) => {
    const attachmentMetadata = taskAttachmentsMetadata[taskId]?.[attachmentId];
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-5 max-w-[1400px] mx-auto">
      <MyTasksDashboard total={data.total} {...data.metrics} />
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
        <div className="space-y-0">
          {data.data.map((task) => {
            const taskAttachments = getAttachments("task", task.id);
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
                      <button
                        onClick={() => handlePreviewClick(task)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Preview Task"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3">
                      {task.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
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

                    {/* Attachments */}
                    {taskAttachments.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="space-y-2">
                          {taskAttachments.map((attachmentId, index) => {
                            const attachmentMetadata =
                              taskAttachmentsMetadata[task.id]?.[attachmentId];
                            const fileName =
                              attachmentMetadata?.originalName ||
                              `Attachment ${index + 1}`;

                            return (
                              <div
                                key={attachmentId}
                                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                                onClick={() =>
                                  handleAttachmentClick(attachmentId, task.id)
                                }
                              >
                                <PaperClipIcon className="w-3 h-3 text-blue-500" />
                                <span className="truncate text-blue-500 hover:text-blue-600 transition-colors">
                                  {fileName}
                                </span>
                                <button
                                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAttachmentClick(
                                      attachmentId,
                                      task.id
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
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <MyTasksFilters />
      <SubmitWorkModal />
      <DetailedTaskCard />
    </div>
  );
}
