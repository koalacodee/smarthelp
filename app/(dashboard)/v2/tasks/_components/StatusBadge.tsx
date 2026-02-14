'use client';

import { TaskStatus } from '@/services/tasks/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  [TaskStatus.TODO]: {
    label: 'To Do',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [TaskStatus.SEEN]: {
    label: 'Seen',
    className: 'bg-blue-100 text-blue-800',
  },
  [TaskStatus.PENDING_REVIEW]: {
    label: 'Pending Review',
    className: 'bg-purple-100 text-purple-800',
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800',
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
