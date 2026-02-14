'use client';

import { useLocaleStore } from '@/lib/store/useLocaleStore';
import { useV2TaskPageStore } from '../_store/use-v2-task-page-store';
import ExportForm from './ExportForm';

interface TaskPageHeaderProps {
  taskCount: number;
}

export default function TaskPageHeader({ taskCount }: TaskPageHeaderProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { role } = useV2TaskPageStore();

  if (!locale) return null;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {locale.tasks.teamTasks.pageHeader.title}
            </h2>
            <p className="text-sm text-slate-600">
              {locale.tasks.teamTasks.pageHeader.count
                .replace('{count}', taskCount.toString())
                .replace('{plural}', taskCount !== 1 ? 's' : '')}
            </p>
          </div>
        </div>
        {role === 'admin' && <ExportForm />}
      </div>
    </div>
  );
}
