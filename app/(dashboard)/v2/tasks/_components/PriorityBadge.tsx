'use client';

import { TaskPriority } from '@/services/tasks/types';

const priorityConfig: Record<string, { label: string; className: string }> = {
  [TaskPriority.HIGH]: {
    label: 'High',
    className: 'bg-red-100 text-red-800',
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    className: 'bg-amber-100 text-amber-800',
  },
  [TaskPriority.LOW]: {
    label: 'Low',
    className: 'bg-green-100 text-green-800',
  },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] ?? {
    label: priority,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
