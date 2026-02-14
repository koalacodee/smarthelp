'use client';

import { useLocaleStore } from '@/lib/store/useLocaleStore';
import { useV2TaskPageStore } from '../_store/use-v2-task-page-store';
import { useDeleteTask, useRestartTask } from '@/services/tasks';
import { useToastStore } from '@/app/(dashboard)/store/useToastStore';
import type { TaskResponse } from '@/services/tasks/types';
import ThreeDotMenu from '@/app/(dashboard)/tasks/components/ThreeDotMenu';

interface TaskCardActionsProps {
  task: TaskResponse;
}

export default function TaskCardActions({ task }: TaskCardActionsProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { openModal } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const deleteMutation = useDeleteTask();
  const restartMutation = useRestartTask();

  if (!locale) return null;

  const options = [
    {
      label: locale.tasks.teamTasks.card.actions.viewDetails,
      onClick: () => openModal('task-detail', task),
      color: 'blue' as const,
    },
    {
      label: locale.tasks.teamTasks.card.actions.edit,
      onClick: () => openModal('edit-task', task),
      color: 'blue' as const,
    },
    {
      label: locale.tasks.teamTasks.card.actions.restart,
      onClick: async () => {
        try {
          await restartMutation.mutateAsync(task.id);
          addToast({ message: locale.tasks.teamTasks.toasts.taskRestarted, type: 'success' });
        } catch {
          addToast({ message: locale.tasks.teamTasks.toasts.restartFailed, type: 'error' });
        }
      },
      color: 'blue' as const,
    },
    {
      label: locale.tasks.teamTasks.card.actions.delete,
      onClick: async () => {
        try {
          await deleteMutation.mutateAsync(task.id);
          addToast({ message: locale.tasks.teamTasks.toasts.taskDeleted, type: 'success' });
        } catch {
          addToast({ message: locale.tasks.teamTasks.toasts.deleteFailed, type: 'error' });
        }
      },
      color: 'red' as const,
    },
  ];

  return <ThreeDotMenu options={options} />;
}
