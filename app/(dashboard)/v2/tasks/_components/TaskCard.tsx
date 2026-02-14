"use client";

import Clock from "@/icons/Clock";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import TaskCardActions from "./TaskCardActions";
import TaskCardSubmissions from "./TaskCardSubmissions";
import InlineAttachments from "@/app/(dashboard)/tasks/components/InlineAttachments";
import { formatDateTimeWithHijri } from "@/locales/dateFormatter";
import type {
  TaskResponse,
  TaskSubmissionResponse,
  TaskDelegationSubmissionResponse,
} from "@/services/tasks/types";

const priorityBarColor: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

interface TaskCardProps {
  task: TaskResponse;
  submissions?: TaskSubmissionResponse[];
  delegationSubmissions?: TaskDelegationSubmissionResponse[];
}

export default function TaskCard({
  task,
  submissions = [],
  delegationSubmissions = [],
}: TaskCardProps) {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);

  if (!locale) return null;

  return (
    <div className="relative bg-white/90 border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${priorityBarColor[task.priority] ?? "bg-gray-500"} rounded-l-2xl`}
      />
      <div className="p-6 ml-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              {task.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {task.description}
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <TaskCardActions task={task} />
          </div>
        </div>

        {/* Badges & metadata */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
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
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <span className="font-medium">
            {locale.tasks.teamTasks.card.assignedTo}
          </span>
          <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
            {task.assigneeName}
          </span>
        </div>

        <InlineAttachments targetId={task.id} />
        <TaskCardSubmissions
          taskId={task.id}
          submissions={submissions}
          delegationSubmissions={delegationSubmissions}
        />
      </div>
    </div>
  );
}
