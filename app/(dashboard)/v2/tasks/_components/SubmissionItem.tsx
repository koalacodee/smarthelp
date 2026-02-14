"use client";

import { useState } from "react";
import Clock from "@/icons/Clock";
import ChevronRight from "@/icons/ChevronRight";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../_store/use-v2-task-page-store";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import InlineAttachments from "@/app/(dashboard)/tasks/components/InlineAttachments";
import { formatDateTimeWithHijri } from "@/locales/dateFormatter";
import type {
  TaskSubmissionResponse,
  TaskDelegationSubmissionResponse,
} from "@/services/tasks/types";

const statusColorMap: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

interface SubmissionItemProps {
  submission: TaskSubmissionResponse | TaskDelegationSubmissionResponse;
  isDelegation?: boolean;
  forwarded?: boolean;
  onForward?: (submissionId: string) => void;
  /** When false, hides Approve/Reject/Forward for delegation submissions (e.g. for employees) */
  canReviewDelegation?: boolean;
}

export default function SubmissionItem({
  submission,
  isDelegation,
  forwarded,
  onForward,
  canReviewDelegation = true,
}: SubmissionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const { openModal } = useV2TaskPageStore();

  const hasContent = Boolean(submission.notes || submission.feedback);
  // Attachments for forwarded delegations stay on the original delegation submission
  const attachmentTargetId =
    "delegationSubmissionId" in submission && submission.delegationSubmissionId
      ? submission.delegationSubmissionId
      : submission.id;
  const statusColor =
    statusColorMap[submission.status] ?? "bg-gray-100 text-gray-800";
  const initial = (submission.performerName ?? submission.performerType)
    .charAt(0)
    .toUpperCase();
  const canReview =
    submission.status !== "APPROVED" && submission.status !== "REJECTED";

  return (
    <div
      className={`rounded p-2 ${isDelegation ? "bg-purple-25 border-l-2 border-purple-300" : "bg-gray-25 border-l border-gray-100"}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 ${isDelegation ? "bg-purple-100" : "bg-gray-100"} rounded-full flex items-center justify-center`}
          >
            <span
              className={`text-xs font-medium ${isDelegation ? "text-purple-600" : "text-gray-500"}`}
            >
              {initial}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-900">
            {submission.performerName ?? submission.performerType}
          </span>
          <span
            className={`text-xs capitalize ${isDelegation ? "text-purple-600" : "text-gray-500"}`}
          >
            ({isDelegation ? "Delegation" : submission.performerType})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isDelegation && forwarded && (
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
              {(locale?.tasks?.delegations?.card as { forwarded?: string })
                ?.forwarded ?? "Forwarded"}
            </span>
          )}
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusColor}`}
          >
            {submission.status}
          </span>
          {hasContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronRight
                className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          )}
          {canReview && !isDelegation && (
            <ThreeDotMenu
              options={[
                {
                  label:
                    locale?.tasks.teamTasks.card.actions.approve ?? "Approve",
                  onClick: () => openModal("approve-submission", submission),
                  color: "green",
                },
                {
                  label:
                    locale?.tasks.teamTasks.card.actions.reject ?? "Reject",
                  onClick: () => openModal("reject-submission", submission),
                  color: "red",
                },
              ]}
            />
          )}
          {isDelegation && canReview && canReviewDelegation && (
            <ThreeDotMenu
              options={[
                {
                  label:
                    locale?.tasks.teamTasks.card.actions.approve ?? "Approve",
                  onClick: () => openModal("approve-submission", submission),
                  color: "green",
                },
                {
                  label:
                    locale?.tasks.teamTasks.card.actions.reject ?? "Reject",
                  onClick: () => openModal("reject-submission", submission),
                  color: "red",
                },
                ...(!forwarded && onForward
                  ? [
                      {
                        label:
                          locale?.tasks.delegations?.card?.forward ?? "Forward",
                        onClick: () => onForward(submission.id),
                        color: "blue" as const,
                      },
                    ]
                  : []),
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
            language ?? "en",
            { month: "short", day: "numeric" },
            { hour: "numeric", minute: "2-digit", hour12: true },
          )}
        </span>
      </div>
      {isExpanded && hasContent && (
        <div className="mt-2 pl-7 space-y-2">
          {submission.notes && (
            <p className="text-xs text-gray-600">{submission.notes}</p>
          )}
          {submission.feedback && (
            <p className="text-xs text-gray-500 italic">
              {locale?.tasks.delegations?.card?.feedback ?? "Feedback:"}{" "}
              {submission.feedback}
            </p>
          )}
          <InlineAttachments targetId={attachmentTargetId} />
        </div>
      )}
    </div>
  );
}
