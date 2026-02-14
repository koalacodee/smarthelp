"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import MyTasksHeader from "./MyTasksHeader";
import MyTasksDashboard from "./MyTasksDashboard";
import MyTasksFilters from "./MyTasksFilters";
import MyTasksList from "./MyTasksList";
import TaskPagination from "../../_components/TaskPagination";
import { useMyTasks, useMyDelegations } from "@/services/tasks";
import { useTaskStore } from "@/services/tasks/store";
import type { Locale } from "@/locales/type";

// Modals
import { TaskDetailModal, SubmitWorkModal } from "../../_components/modals";
import ForwardDelegationModal from "../../_components/modals/ForwardDelegationModal";
import DelegationModal from "./DelegationModal";
import SubmitDelegationModal from "./SubmitDelegationModal";

interface MyTasksHydratorProps {
  role: "admin" | "supervisor" | "employee";
  departments: any[];
  subDepartments: any[];
  locale: Locale;
  language: string;
}

export default function MyTasksHydrator({
  role,
  departments,
  subDepartments,
  locale,
  language,
}: MyTasksHydratorProps) {
  const { setLocale } = useLocaleStore();
  const { setServerData, cursor, direction } = useV2TaskPageStore();
  const { activeFilters } = useTaskStore();

  useEffect(() => {
    setLocale(locale, language);
    setServerData({ role, departments, subDepartments });
  }, []);

  // Query hooks for data
  const myTasksQuery = useMyTasks({
    status: activeFilters.status,
    search: activeFilters.search,
    departmentId:
      role === "supervisor" ? activeFilters.departmentId : undefined,
    subDepartmentId:
      role === "employee" ? activeFilters.departmentId : undefined,
    cursor,
    direction,
    pageSize: 10,
  });


  const metrics = myTasksQuery.data?.metrics;
  const meta = myTasksQuery.data?.meta;
  const tasks = myTasksQuery.data?.data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <MyTasksHeader />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-5">
          <div className="space-y-5">
            {metrics && (
              <MyTasksDashboard
                total={metrics.pendingTasks + metrics.completedTasks}
                completedCount={metrics.completedTasks}
                pendingCount={metrics.pendingTasks}
                completionPercentage={metrics.taskCompletionPercentage}
              />
            )}
            <MyTasksFilters />
          </div>
          <div>
            <MyTasksList
              tasks={tasks}
              isLoading={myTasksQuery.isLoading || myTasksQuery.isFetching}
            />
            <TaskPagination meta={meta} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskDetailModal />
      <SubmitWorkModal />
      <ForwardDelegationModal />
      <DelegationModal />
      <SubmitDelegationModal />
    </div>
  );
}
