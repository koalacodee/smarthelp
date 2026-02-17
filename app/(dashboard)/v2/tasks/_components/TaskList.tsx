'use client';

import { useLocaleStore } from '@/lib/store/useLocaleStore';
import { useTaskStore } from '@/services/tasks/store';
import { useV2TaskPageStore } from '../_store/use-v2-task-page-store';
import { useDepartmentLevelTasks, useTeamTasksForSupervisor } from '@/services/tasks';
import TaskCard from './TaskCard';
import TaskPagination from './TaskPagination';
import TaskDashboard from './TaskDashboard';
import EmptyState from './EmptyState';
import type { GetDepartmentLevelTasksParams, GetTeamTasksForSupervisorParams } from '@/services/tasks/types';

export default function TaskList() {
  const locale = useLocaleStore((state) => state.locale);
  const { role, cursor, direction } = useV2TaskPageStore();
  const { activeFilters } = useTaskStore();

  const adminParams: GetDepartmentLevelTasksParams = {
    status: activeFilters.status,
    priority: activeFilters.priority,
    search: activeFilters.search,
    departmentId: activeFilters.departmentId,
    cursor, direction, pageSize: 10,
  };

  const supervisorParams: GetTeamTasksForSupervisorParams = {
    status: activeFilters.status,
    priority: activeFilters.priority,
    search: activeFilters.search,
    subDepartmentId: activeFilters.departmentId,
    cursor, direction, pageSize: 10,
  };

  const adminQuery = useDepartmentLevelTasks(adminParams, role === 'admin');
  const supervisorQuery = useTeamTasksForSupervisor(supervisorParams, role === 'supervisor');

  const query = role === 'admin' ? adminQuery : supervisorQuery;
  const isLoading = query.isLoading || query.isFetching;

  // Extract tasks and metrics based on role
  const adminData = role === 'admin' ? adminQuery.data : null;
  const supervisorData = role === 'supervisor' ? supervisorQuery.data : null;

  const tasks =
    adminData?.data.tasks ??
    supervisorData?.data?.tasks?.map((t) => t.task) ??
    [];
  const submissions = adminData?.data.submissions ?? [];

  const delegationSubs =
    role === 'supervisor'
      ? supervisorData?.data?.tasks?.flatMap(
        (t) => t.delegationSubmissions ?? [],
      ) ?? []
      : [];
  const meta = query.data?.meta;

  const metrics = adminData?.data.metrics
    ? { total: adminData.data.metrics.pendingCount + adminData.data.metrics.completedCount, completedCount: adminData.data.metrics.completedCount, pendingCount: adminData.data.metrics.pendingCount, completionPercentage: adminData.data.metrics.completionPercentage }
    : supervisorData?.data.metrics
      ? { total: supervisorData.data.metrics.pendingTasks + supervisorData.data.metrics.completedTasks, completedCount: supervisorData.data.metrics.completedTasks, pendingCount: supervisorData.data.metrics.pendingTasks, completionPercentage: supervisorData.data.metrics.taskCompletionPercentage }
      : null;

  // Build per-task submission maps
  const submissionsByTask = new Map<string, typeof submissions>();
  submissions.forEach((s) => {
    if (!s.taskId) return;
    const arr = submissionsByTask.get(s.taskId) ?? [];
    arr.push(s);
    submissionsByTask.set(s.taskId, arr);
  });

  // For supervisor, submissions come nested inside each task item
  if (role === 'supervisor' && supervisorData) {
    supervisorData.data.tasks.forEach((t) => {
      if (t.submissions?.length) {
        submissionsByTask.set(t.task.id, t.submissions);
      }
    });
  }

  const delegationSubsByTask = new Map<string, typeof delegationSubs>();
  if (role === 'supervisor' && supervisorData) {
    supervisorData.data.tasks.forEach((t) => {
      if (t.delegationSubmissions?.length) {
        delegationSubsByTask.set(t.task.id, t.delegationSubmissions);
      }
    });
  }

  return (
    <>
      {/* Dashboard - passed via context */}
      {metrics && (
        <div className="lg:hidden mb-6">
          <TaskDashboard {...metrics} />
        </div>
      )}

      {/* Desktop dashboard in sidebar is rendered by parent */}
      {/* This component renders the hidden mobile dashboard + task list */}

      <div className="bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <p className="mt-4 text-sm text-slate-500">{locale?.tasks.teamTasks.loading ?? 'Loading tasks...'}</p>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title={locale?.tasks.teamTasks.empty.title}
            message={locale?.tasks.teamTasks.empty.hint}
          />
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                submissions={submissionsByTask.get(task.id) ?? []}
                delegationSubmissions={delegationSubsByTask.get(task.id) ?? []}
              />
            ))}
          </div>
        )}
        <TaskPagination meta={meta} />
      </div>

      {/* Expose metrics for sidebar via a callback trick - parent reads from query */}
    </>
  );
}
