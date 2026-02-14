"use client";

import ThreeDotMenu, {
  type MenuOption,
} from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import Eye from "@/icons/Eye";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useMarkTaskSeen, useMarkDelegationSeen } from "@/services/tasks";
import type { UnifiedMyTaskItemResponse } from "@/services/tasks/types";

interface MyTaskCardActionsProps {
  item: UnifiedMyTaskItemResponse;
  rejectionReason?: string;
  approvalFeedback?: string;
}

export default function MyTaskCardActions({
  item,
  rejectionReason,
  approvalFeedback,
}: MyTaskCardActionsProps) {
  const locale = useLocaleStore((s) => s.locale);
  const { openModal, role } = useV2TaskPageStore();
  const markTaskSeen = useMarkTaskSeen();
  const markDelegationSeen = useMarkDelegationSeen();

  if (!locale) return null;

  const task = item.task;

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
      onClick: () => {
        if (item.type === "delegation" && item.delegationId) {
          markDelegationSeen.mutate(item.delegationId);
        } else {
          markTaskSeen.mutate(item.taskId);
        }
      },
      color: "blue",
    });
  }

  if (role === "supervisor") {
    options.push({
      label: locale.tasks.modals.delegation.title,
      onClick: () => openModal("delegation", { taskId: item.taskId }),
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
