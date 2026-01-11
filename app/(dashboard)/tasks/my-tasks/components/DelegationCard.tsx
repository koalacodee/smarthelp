"use client";

import { useState, useMemo } from "react";
import {
  TaskDelegationDTO,
  TaskDelegationSubmissionDTO,
} from "@/lib/api/v2/services/delegations";
import Eye from "@/icons/Eye";
import Clock from "@/icons/Clock";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { TaskDelegationService } from "@/lib/api/v2";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useMyDelegationsStore } from "../store/useMyDelegationsStore";
import InlineAttachments from "../../components/InlineAttachments";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateTimeWithHijri, formatDateWithHijri } from "@/locales/dateFormatter";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING_REVIEW":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "TODO":
      return "bg-amber-100 text-amber-800";
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

interface DelegationCardProps {
  delegation: TaskDelegationDTO;
  submissions: TaskDelegationSubmissionDTO[];
  delegationSubmissionAttachments: { [submissionId: string]: string[] };
}

export default function DelegationCard({
  delegation,
  submissions,
}: DelegationCardProps) {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const [isSubmissionsExpanded, setIsSubmissionsExpanded] = useState(false);
  const { addToast } = useToastStore();
  const { updateDelegation } = useMyDelegationsStore();

  if (!locale) return null;

  // Get the latest submission (the one with the biggest submittedAt)
  const latestSubmission = useMemo(() => {
    if (submissions.length === 0) return null;
    return submissions.reduce((latest, current) => {
      const latestDate = new Date(latest.submittedAt).getTime();
      const currentDate = new Date(current.submittedAt).getTime();
      return currentDate > latestDate ? current : latest;
    });
  }, [submissions]);

  const handleApprove = async () => {
    if (!latestSubmission) {
      addToast({ message: locale.tasks.toasts.approvalFailed, type: "error" });
      return;
    }

    try {
      const response = await TaskDelegationService.approveSubmission(
        latestSubmission.id,
        {}
      );
      updateDelegation(delegation.id.toString(), response.delegation);
      addToast({
        message: locale.tasks.toasts.approvalSuccess,
        type: "success",
      });
    } catch (error: any) {
      addToast({
        message:
          error?.response?.data?.message || locale.tasks.toasts.approvalFailed,
        type: "error",
      });
    }
  };

  const handleReject = async () => {
    if (!latestSubmission) {
      addToast({ message: locale.tasks.toasts.rejectionFailed, type: "error" });
      return;
    }

    try {
      const response = await TaskDelegationService.rejectSubmission(
        latestSubmission.id,
        {}
      );
      updateDelegation(delegation.id.toString(), response.delegation);
      addToast({
        message: locale.tasks.toasts.rejectionSuccess,
        type: "success",
      });
    } catch (error: any) {
      addToast({
        message:
          error?.response?.data?.message || locale.tasks.toasts.rejectionFailed,
        type: "error",
      });
    }
  };

  const handleForward = async () => {
    if (!latestSubmission) {
      addToast({ message: locale.tasks.toasts.approvalFailed, type: "error" });
      return;
    }

    try {
      await TaskDelegationService.forwardSubmission(latestSubmission.id, {});
      addToast({
        message: "Submission forwarded successfully",
        type: "success",
      });
    } catch (error: any) {
      addToast({
        message:
          error?.response?.data?.message || "Failed to forward submission",
        type: "error",
      });
    }
  };

  const task = delegation.task;
  if (!task) return null;

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
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
            <div className="flex items-center gap-1">
              <button
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title={locale.tasks.delegations.actions.viewDetails}
              >
                <Eye className="w-4 h-4" />
              </button>
              {latestSubmission && (
                <ThreeDotMenu
                  options={[
                    {
                      label: locale.tasks.teamTasks.card.actions.approve,
                      onClick: handleApprove,
                      color: "green",
                    },
                    {
                      label: locale.tasks.teamTasks.card.actions.reject,
                      onClick: handleReject,
                      color: "red",
                    },
                    {
                      label: locale.tasks.delegations.card.forward,
                      onClick: handleForward,
                      color: "blue",
                    },
                  ]}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3">{task.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
              <DelegationIcon className="w-3 h-3" />
              {locale.tasks.delegations.delegated}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                delegation.status
              )}`}
            >
              {delegation.status === "PENDING_REVIEW"
                ? locale.tasks.delegations.filters.status.pendingReview
                : delegation.status === "COMPLETED"
                ? locale.tasks.delegations.filters.status.completed
                : locale.tasks.delegations.filters.status.todo}
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
              {task.priority === "HIGH"
                ? locale.tasks.modals.addTask.priorityOptions.high
                : task.priority === "MEDIUM"
                ? locale.tasks.modals.addTask.priorityOptions.medium
                : locale.tasks.modals.addTask.priorityOptions.low}
            </span>
            {delegation.assignmentType && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {delegation.assignmentType === "INDIVIDUAL"
                  ? locale.tasks.delegations.card.individual
                  : locale.tasks.delegations.card.subDepartment}
              </span>
            )}
          </div>

          {/* Assignment Info */}
          <div className="text-xs text-gray-500 mb-3">
            {delegation.assignmentType === "INDIVIDUAL" &&
            delegation.assignee ? (
              <p>
                {locale.tasks.teamTasks.card.assignedTo}{" "}
                <span className="font-medium">
                  {delegation.assignee.user?.name || "Employee"}
                </span>
              </p>
            ) : delegation.targetSubDepartment ? (
              <p>
                {locale.tasks.teamTasks.card.assignedTo}{" "}
                <span className="font-medium">
                  {delegation.targetSubDepartment.name}
                </span>
              </p>
            ) : null}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
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

          {/* TODO: The new Attachments System */}
          <InlineAttachments targetId={delegation.taskId.toString()} />

          {/* Submissions */}
          {submissions.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={() => setIsSubmissionsExpanded(!isSubmissionsExpanded)}
                className="text-xs font-medium text-gray-700 hover:text-purple-600 transition-colors mb-2"
              >
                {isSubmissionsExpanded
                  ? locale.tasks.delegations.card.hideSubmissions
                  : locale.tasks.delegations.card.showSubmissions}{" "}
                {locale.tasks.teamTasks.card.submissions} ({submissions.length})
              </button>
              {isSubmissionsExpanded && (
                <div className="space-y-2 mt-2">
                  {submissions.map((submission) => {
                    return (
                      <div
                        key={submission.id.toString()}
                        className="bg-gray-50 rounded p-2 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {submission.performerName ||
                              submission.performerType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${getSubmissionStatusColor(
                              submission.status
                            )}`}
                          >
                            {submission.status}
                          </span>
                        </div>
                        {submission.notes && (
                          <p className="text-gray-600 mt-1">
                            {submission.notes}
                          </p>
                        )}
                        {submission.feedback && (
                          <p className="text-gray-500 mt-1 italic">
                            {locale.tasks.delegations.card.feedback}{" "}
                            {submission.feedback}
                          </p>
                        )}
                        <InlineAttachments
                          targetId={submission.id.toString()}
                        />
                        <p className="text-gray-400 mt-1">
                          {locale.tasks.delegations.card.submitted}{" "}
                          {formatDateWithHijri(submission.submittedAt, language)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
