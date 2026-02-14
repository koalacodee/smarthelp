"use client";

import Users from "@/icons/User";
import ChevronRight from "@/icons/ChevronRight";
import Eye from "@/icons/Eye";
import Clock from "@/icons/Clock";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import InlineAttachments from "@/app/(dashboard)/tasks/components/InlineAttachments";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import {
  useApproveDelegationSubmission,
  useRejectDelegationSubmission,
  useForwardDelegationSubmission,
} from "@/services/tasks";
import { formatDateTimeWithHijri } from "@/locales/dateFormatter";
import SubmissionItem from "../../_components/SubmissionItem";
import type {
  DelegationResponse,
  TaskDelegationSubmissionResponse,
} from "@/services/tasks/types";
import { useMemo } from "react";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-yellow-500";
    case "LOW":
      return "bg-green-500";
    default:
      return "bg-purple-500";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING_REVIEW":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "TODO":
      return "bg-amber-100 text-amber-800";
    case "SEEN":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "LOW":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface MyDelegationsDelegationCardProps {
  delegation: DelegationResponse;
  submissions: TaskDelegationSubmissionResponse[];
}

export default function MyDelegationsDelegationCard({
  delegation,
  submissions,
}: MyDelegationsDelegationCardProps) {
  const locale = useLocaleStore((s) => s.locale);
  const language = useLocaleStore((s) => s.language);
  const { expandedSubmissions, toggleSubmissions, openModal } = useV2TaskPageStore();
  const approveMutation = useApproveDelegationSubmission();
  const rejectMutation = useRejectDelegationSubmission();
  const forwardMutation = useForwardDelegationSubmission();

  const isExpanded = expandedSubmissions.has(delegation.id);

  const latestSubmission = useMemo(() => {
    if (submissions.length === 0) return null;
    return submissions.reduce((latest, current) => {
      return new Date(current.submittedAt).getTime() >
        new Date(latest.submittedAt).getTime()
        ? current
        : latest;
    });
  }, [submissions]);

  if (!locale) return null;

  const taskTitle = delegation.task?.title ?? delegation.taskId;
  const taskPriority = delegation.task?.priority ?? "MEDIUM";

  const handleViewDetails = () => {
    if (delegation.task) {
      openModal("task-detail", delegation.task);
    }
  };

  const handleForward = (submissionId: string) => {
    openModal("forward-delegation", submissions.find((s) => s.id === submissionId));
  };

  const menuOptions = [];
  if (latestSubmission) {
    menuOptions.push(
      {
        label: locale.tasks.teamTasks?.card?.actions?.approve ?? "Approve",
        onClick: () =>
          approveMutation.mutate({
            submissionId: latestSubmission.id,
            data: {},
          }),
        color: "green" as const,
      },
      {
        label: locale.tasks.teamTasks?.card?.actions?.reject ?? "Reject",
        onClick: () =>
          rejectMutation.mutate({
            submissionId: latestSubmission.id,
            data: {},
          }),
        color: "red" as const,
      },
    );
    if (!latestSubmission.forwarded) {
      menuOptions.push({
        label: locale.tasks.delegations?.card?.forward ?? "Forward",
        onClick: () => handleForward(latestSubmission.id),
        color: "blue" as const,
      });
    }
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(taskPriority)} rounded-l-lg`}
      />

      <div className="flex items-start gap-3 ml-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {taskTitle}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handleViewDetails}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title={locale.tasks.delegations?.actions?.viewDetails ?? "View details"}
              >
                <Eye className="w-4 h-4" />
              </button>
              {menuOptions.length > 0 && (
                <ThreeDotMenu options={menuOptions} />
              )}
            </div>
          </div>

          {delegation.task?.description && (
            <p className="text-xs text-gray-600 mb-3">
              {delegation.task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {locale.tasks.delegations?.delegated ?? "Delegated"}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(delegation.status)}`}
            >
              {delegation.status === "PENDING_REVIEW"
                ? (locale.tasks.delegations?.filters?.status?.pendingReview ?? "Pending Review")
                : delegation.status === "COMPLETED"
                  ? (locale.tasks.delegations?.filters?.status?.completed ?? "Completed")
                  : (locale.tasks.delegations?.filters?.status?.todo ?? "To Do")}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(taskPriority)}`}
            >
              {taskPriority === "HIGH"
                ? (locale.tasks.modals?.addTask?.priorityOptions?.high ?? "High")
                : taskPriority === "MEDIUM"
                  ? (locale.tasks.modals?.addTask?.priorityOptions?.medium ?? "Medium")
                  : (locale.tasks.modals?.addTask?.priorityOptions?.low ?? "Low")}
            </span>
            {delegation.assignmentType && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {delegation.assignmentType === "INDIVIDUAL"
                  ? (locale.tasks.delegations?.card?.individual ?? "Individual")
                  : (locale.tasks.delegations?.card?.subDepartment ??
                      "Sub-Department")}
              </span>
            )}
          </div>

          {(delegation.assignee?.name || delegation.targetSubDepartment?.name) && (
            <div className="text-xs text-gray-500 mb-3">
              {locale.tasks.teamTasks?.card?.assignedTo ?? "Assigned to"}{" "}
              <span className="font-medium">
                {delegation.assignee?.name ??
                  delegation.targetSubDepartment?.name ??
                  "—"}
              </span>
            </div>
          )}

          {delegation.task?.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <Clock className="w-3 h-3" />
              <span>
                {locale.tasks.teamTasks?.card?.dueDate ?? "Due"}{" "}
                {formatDateTimeWithHijri(
                  delegation.task.dueDate,
                  language ?? "en",
                  { month: "short", day: "numeric" },
                  { hour: "numeric", minute: "2-digit", hour12: true },
                )}
              </span>
            </div>
          )}

          <InlineAttachments targetId={delegation.taskId} />

          {submissions.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mb-4">
              <button
                onClick={() => toggleSubmissions(delegation.id)}
                className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-1 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {locale?.tasks.teamTasks.card.submissions ?? "Submissions"} (
                    {submissions.length})
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {submissions.map((sub) => (
                    <SubmissionItem
                      key={sub.id}
                      submission={sub}
                      isDelegation
                      forwarded={sub.forwarded}
                      onForward={handleForward}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
