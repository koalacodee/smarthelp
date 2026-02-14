'use client';

import Link from 'next/link';
import { useLocaleStore } from '@/lib/store/useLocaleStore';
import { useV2TaskPageStore } from '../../_store/use-v2-task-page-store';

export default function MyTasksHeader() {
  const locale = useLocaleStore((state) => state.locale);
  const { role } = useV2TaskPageStore();
  if (!locale) return null;

  const isSupervisor = role === 'supervisor';

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          {locale.tasks.myTasks?.pageTitle ?? 'My Tasks'}
        </h2>
        <div className="flex items-center gap-2">
          <Link href="/v2/tasks/my-tasks" className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
            {locale.tasks.myTasks?.tabs?.tasks ?? 'Tasks'}
          </Link>
          {isSupervisor && (
            <Link href="/v2/tasks/my-delegations" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">
              {locale.tasks.myTasks?.tabs?.myDelegations ?? 'My Delegations'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
