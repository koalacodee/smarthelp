'use client';

import { useLocaleStore } from '@/lib/store/useLocaleStore';

interface TaskDashboardProps {
  total: number;
  completedCount: number;
  pendingCount: number;
  completionPercentage: number;
}

export default function TaskDashboard({ total, completedCount, pendingCount, completionPercentage }: TaskDashboardProps) {
  const locale = useLocaleStore((state) => state.locale);
  if (!locale) return null;

  const items = [
    { icon: '📋', label: locale.tasks.teamTasks.dashboard.totalTasks, value: total, color: 'text-[#667eea]' },
    { icon: '✅', label: locale.tasks.teamTasks.dashboard.completed, value: completedCount, color: 'text-[#48bb78]' },
    { icon: '🟡', label: locale.tasks.teamTasks.dashboard.inProgress, value: pendingCount, color: 'text-[#f59e0b]' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">
        {locale.tasks.teamTasks.dashboard.title}
      </h3>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
          background: `conic-gradient(#3b82f6 0deg ${completionPercentage * 3.6}deg, #e2e8f0 ${completionPercentage * 3.6}deg 360deg)`,
        }}
      >
        <span className="text-lg font-bold bg-white rounded-full w-16 h-16 flex items-center justify-center">
          {completionPercentage}%
        </span>
      </div>
      <ul className="list-none">
        {items.map((item, index) => (
          <li key={item.label} className={`flex justify-between py-2.5 ${index < 2 ? 'border-b border-[#e2e8f0]' : ''} text-sm`}>
            <span>
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </span>
            <span className={item.color}>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
