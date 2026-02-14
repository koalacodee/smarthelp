"use client";

import ChevronRight from "@/icons/ChevronRight";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../_store/use-v2-task-page-store";
import SubmissionItem from "./SubmissionItem";
import type {
  TaskSubmissionResponse,
  TaskDelegationSubmissionResponse,
} from "@/services/tasks/types";

interface TaskCardSubmissionsProps {
  taskId: string;
  submissions: TaskSubmissionResponse[];
  delegationSubmissions: TaskDelegationSubmissionResponse[];
}

export default function TaskCardSubmissions({
  taskId,
  submissions,
  delegationSubmissions,
}: TaskCardSubmissionsProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { expandedSubmissions, toggleSubmissions } = useV2TaskPageStore();
  const isExpanded = expandedSubmissions.has(taskId);
  const totalCount = submissions.length + delegationSubmissions.length;

  if (totalCount === 0) return null;

  return (
    <div className="border-t border-gray-200 pt-3 mb-4">
      <button
        onClick={() => toggleSubmissions(taskId)}
        className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-1 rounded transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
          <span className="text-xs font-medium text-gray-700">
            {locale?.tasks.teamTasks.card.submissions ?? "Submissions"} (
            {totalCount})
          </span>
        </div>
      </button>
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {submissions.map((sub) => (
            <SubmissionItem key={sub.id} submission={sub} />
          ))}
          {delegationSubmissions.map((sub) => (
            <SubmissionItem key={sub.id} submission={sub} isDelegation />
          ))}
        </div>
      )}
    </div>
  );
}
