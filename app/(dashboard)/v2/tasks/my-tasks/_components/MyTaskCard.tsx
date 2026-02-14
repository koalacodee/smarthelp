"use client";

// import { Clock } from 'lucide-react';
import Clock from "@/icons/Clock";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import StatusBadge from "../../_components/StatusBadge";
import PriorityBadge from "../../_components/PriorityBadge";
import MyTaskCardActions from "./MyTaskCardActions";
import FeedbackCollapsible from "./FeedbackCollapsible";
import InlineAttachments from "@/app/(dashboard)/tasks/components/InlineAttachments";
import { formatDateTimeWithHijri } from "@/locales/dateFormatter";
import type { MyTaskItemResponse } from "@/services/tasks/types";

const priorityBarColor: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

interface MyTaskCardProps {
  item: MyTaskItemResponse;
}

export default function MyTaskCard({ item }: MyTaskCardProps) {
  const locale = useLocaleStore((s) => s.locale);
  const language = useLocaleStore((s) => s.language);
  const { openModal } = useV2TaskPageStore();

  if (!locale) return null;

  const task = item.task;
  const isActionable = task.status === "TODO" || task.status === "SEEN";

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Priority bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${priorityBarColor[task.priority] ?? "bg-gray-500"} rounded-l-lg`}
      />

      <div className="flex items-start gap-3 ml-2">
        {/* Submit work checkbox */}
        {isActionable && (
          <button
            onClick={() => openModal("submit-work", task)}
            className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-blue-500 transition-colors flex-shrink-0 mt-0.5"
          />
        )}

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Title + actions */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {task.title}
            </h3>
            <MyTaskCardActions
              task={task}
              rejectionReason={item.rejectionReason}
              approvalFeedback={item.approvalFeedback}
            />
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3">{task.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <Clock className="w-3 h-3" />
              <span>
                {locale.tasks.teamTasks.card.dueDate}{" "}
                {formatDateTimeWithHijri(
                  task.dueDate,
                  language ?? "en",
                  { month: "short", day: "numeric" },
                  { hour: "numeric", minute: "2-digit", hour12: true },
                )}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <span className="font-medium">
              {locale.tasks.teamTasks.card.assignedTo}
            </span>
            <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
              {task.assigneeName}
            </span>
          </div>

          <InlineAttachments targetId={task.id} />

          {/* Feedback collapsible */}
          <FeedbackCollapsible
            taskId={task.id}
            rejectionReason={item.rejectionReason}
            approvalFeedback={item.approvalFeedback}
            locale={{
              rejectionLabel: locale.tasks.modals.taskRejection.fields.reason,
              approvalLabel: locale.tasks.modals.approval.title,
            }}
          />
        </div>
      </div>
    </div>
  );
}
