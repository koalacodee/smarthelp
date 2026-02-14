"use client";

import ThreeDotMenu, {
  type MenuOption,
} from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import Eye from "@/icons/Eye";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useMarkTaskSeen } from "@/services/tasks";
import type { TaskResponse } from "@/services/tasks/types";

interface MyTaskCardActionsProps {
  task: TaskResponse;
  rejectionReason?: string;
  approvalFeedback?: string;
}

export default function MyTaskCardActions({
  task,
  rejectionReason,
  approvalFeedback,
}: MyTaskCardActionsProps) {
  const locale = useLocaleStore((s) => s.locale);
  const { openModal, role } = useV2TaskPageStore();
  const markSeen = useMarkTaskSeen();

  if (!locale) return null;

  const handlePreview = () => {
    openModal("task-detail", task);
  };

  const isTodoOrSeen = task.status === "TODO" || task.status === "SEEN";
  if (!isTodoOrSeen) {
    return (
      <button
        onClick={handlePreview}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        title={locale.tasks.myTasks.actions.viewDetails}
      >
        <Eye className="w-4 h-4" />
      </button>
    );
  }

  const options: MenuOption[] = [];

  if (task.status === "TODO") {
    options.push({
      label: locale.tasks.myTasks.actions.markAsSeen,
      onClick: () => markSeen.mutate(task.id),
      color: "blue",
    });
  }

  if (role === "supervisor") {
    options.push({
      label: locale.tasks.modals.delegation.title,
      onClick: () => openModal("delegation", { taskId: task.id }),
      color: "green",
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePreview}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        title={locale.tasks.myTasks.actions.viewDetails}
      >
        <Eye className="w-4 h-4" />
      </button>
      {options.length > 0 && <ThreeDotMenu options={options} />}
    </div>
  );
}
