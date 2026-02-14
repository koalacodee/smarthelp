"use client";

import Users from "@/icons/User";
import ChevronDown from "@/icons/ChevronDown";
import Eye from "@/icons/Eye";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import StatusBadge from "../../_components/StatusBadge";
import InlineAttachments from "@/app/(dashboard)/tasks/components/InlineAttachments";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import SubmissionItem from "../../_components/SubmissionItem";
import {
  useApproveDelegationSubmission,
  useRejectDelegationSubmission,
} from "@/services/tasks";
import type {
  DelegationResponse,
  TaskDelegationSubmissionResponse,
} from "@/services/tasks/types";
import { useMemo } from "react";

const priorityBarColor: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

interface DelegationCardProps {
  delegation: DelegationResponse;
  submissions: TaskDelegationSubmissionResponse[];
  isEmployee?: boolean;
}

export default function DelegationCard({
  delegation,
  submissions,
  isEmployee = false,
}: DelegationCardProps) {
  const locale = useLocaleStore((s) => s.locale);
  const language = useLocaleStore((s) => s.language);
  const { expandedSubmissions, toggleSubmissions, openModal } =
    useV2TaskPageStore();
  const approveMutation = useApproveDelegationSubmission();
  const rejectMutation = useRejectDelegationSubmission();

  const handleForward = (submissionId: string) => {
    openModal("forward-delegation", submissions.find((s) => s.id === submissionId));
  };

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
  const handleSubmitWork = () => {
    openModal("submit-delegation", delegation);
  };

  const handleViewDetails = () => {
    if (delegation.task) {
      openModal("task-detail", delegation.task);
    }
  };

  const menuOptions: Array<{
    label: string;
    onClick: () => void;
    color?: "green" | "red" | "blue";
  }> = [];
  if (isEmployee) {
    menuOptions.push({
      label: locale.tasks.delegations?.actions?.viewDetails ?? "View details",
      onClick: handleViewDetails,
      color: "blue",
    });
    if (!latestSubmission) {
      menuOptions.push({
        label: locale.tasks.delegations?.actions?.submitWork ?? "Submit Work",
        onClick: handleSubmitWork,
        color: "blue",
      });
    }
  } else {
    if (latestSubmission) {
      menuOptions.push(
        {
          label: locale.tasks.teamTasks.card.actions.approve,
          onClick: () =>
            approveMutation.mutate({
              submissionId: latestSubmission.id,
              data: {},
            }),
          color: "green",
        },
        {
          label: locale.tasks.teamTasks.card.actions.reject,
          onClick: () =>
            rejectMutation.mutate({
              submissionId: latestSubmission.id,
              data: {},
            }),
          color: "red",
        }
      );
      if (!latestSubmission.forwarded) {
        menuOptions.push({
          label: locale.tasks.delegations?.card?.forward ?? "Forward",
          onClick: () => handleForward(latestSubmission.id),
          color: "blue",
        });
      }
    } else {
      menuOptions.push({
        label: locale.tasks.delegations?.actions?.submitWork ?? "Submit Work",
        onClick: handleSubmitWork,
        color: "blue",
      });
    }
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Priority bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-lg`}
      />

      <div className="flex items-start gap-3 ml-2">
        {/* Submit work checkbox */}
        <button
          onClick={handleSubmitWork}
          className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-purple-500 transition-colors flex-shrink-0 mt-0.5"
        />

        {/* Delegation content */}
        <div className="flex-1 min-w-0">
          {/* Title + actions */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {taskTitle}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handleViewDetails}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title={
                  locale.tasks.delegations?.actions?.viewDetails ?? "View details"
                }
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

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {locale.tasks.delegations?.delegated ?? "Delegated"}
            </span>
            <StatusBadge status={delegation.status} />
            {delegation.assignmentType && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {delegation.assignmentType === "INDIVIDUAL"
                  ? (locale.tasks.delegations?.card?.individual ?? "Individual")
                  : (locale.tasks.delegations?.card?.subDepartment ??
                    "Sub-Department")}
              </span>
            )}
          </div>

          <InlineAttachments targetId={delegation.taskId} />

          {/* Submissions */}
          {submissions.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              <button
                onClick={() => toggleSubmissions(delegation.id)}
                className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-purple-600 transition-colors mb-2"
              >
                <span>
                  {isExpanded
                    ? (locale.tasks.delegations?.card?.hideSubmissions ??
                      "Hide")
                    : (locale.tasks.delegations?.card?.showSubmissions ??
                      "Show")}{" "}
                  {locale.tasks.teamTasks?.card?.submissions ?? "Submissions"} (
                  {submissions.length})
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {isExpanded && (
                <div className="space-y-2 mt-2">
                  {submissions.map((sub) => (
                    <SubmissionItem
                      key={sub.id}
                      submission={sub}
                      isDelegation
                      forwarded={sub.forwarded}
                      onForward={handleForward}
                      canReviewDelegation={!isEmployee}
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
