"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../_store/use-v2-task-page-store";
import TaskPageHeader from "./TaskPageHeader";
import TaskDashboard from "./TaskDashboard";
import TaskFilters from "./TaskFilters";
import TaskList from "./TaskList";
import AddTaskFab from "./AddTaskFab";
import {
  useDepartmentLevelTasks,
  useTeamTasksForSupervisor,
} from "@/services/tasks";
import { useTaskStore } from "@/services/tasks/store";
import type { Locale } from "@/locales/type";

// Modals
import AddTaskModal from "./modals/AddTaskModal";
import EditTaskModal from "./modals/EditTaskModal";
import TaskDetailModal from "./modals/TaskDetailModal";
import SubmitWorkModal from "./modals/SubmitWorkModal";
import TaskPresetsModal from "./modals/TaskPresetsModal";
import CreateFromPresetModal from "./modals/CreateFromPresetModal";
import ApproveSubmissionModal from "./modals/ApproveSubmissionModal";
import RejectSubmissionModal from "./modals/RejectSubmissionModal";
import RejectTaskModal from "./modals/RejectTaskModal";

interface TaskPageHydratorProps {
  initialData: any;
  role: "admin" | "supervisor";
  departments: any[];
  subDepartments: any[];
  locale: Locale;
  language: string;
}

export default function TaskPageHydrator({
  initialData,
  role,
  departments,
  subDepartments,
  locale,
  language,
}: TaskPageHydratorProps) {
  const { setLocale } = useLocaleStore();
  const { setServerData, cursor, direction } = useV2TaskPageStore();
  const { activeFilters } = useTaskStore();

  // Hydrate locale + server data once
  useEffect(() => {
    setLocale(locale, language);
    setServerData({ role, departments, subDepartments });
  }, []);

  // Read the query data to get metrics for the sidebar dashboard
  const adminQuery = useDepartmentLevelTasks(
    {
      status: activeFilters.status,
      priority: activeFilters.priority,
      search: activeFilters.search,
      departmentId: activeFilters.departmentId,
      cursor,
      direction,
      pageSize: 10,
    },
    role === "admin",
  );

  const supervisorQuery = useTeamTasksForSupervisor(
    {
      status: activeFilters.status,
      priority: activeFilters.priority,
      search: activeFilters.search,
      subDepartmentId: activeFilters.departmentId,
      cursor,
      direction,
      pageSize: 10,
    },
    role === "supervisor",
  );

  const adminData = role === "admin" ? adminQuery.data : null;
  const supervisorData = role === "supervisor" ? supervisorQuery.data : null;

  const metrics = adminData?.data.metrics
    ? {
      total:
        adminData.data.metrics.pendingCount +
        adminData.data.metrics.completedCount,
      completedCount: adminData.data.metrics.completedCount,
      pendingCount: adminData.data.metrics.pendingCount,
      completionPercentage: adminData.data.metrics.completionPercentage,
    }
    : supervisorData?.data.metrics
      ? {
        total:
          supervisorData.data.metrics.pendingTasks +
          supervisorData.data.metrics.completedTasks,
        completedCount: supervisorData.data.metrics.completedTasks,
        pendingCount: supervisorData.data.metrics.pendingTasks,
        completionPercentage:
          supervisorData.data.metrics.taskCompletionPercentage,
      }
      : null;

  const taskCount =
    adminData?.data.tasks.length ?? supervisorData?.data.tasks.length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <TaskPageHeader taskCount={taskCount} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8">
          {/* Left sidebar */}
          <div className="space-y-6">
            {metrics && (
              <div className="hidden lg:block">
                <TaskDashboard {...metrics} />
              </div>
            )}
            <TaskFilters />
          </div>
          {/* Right content */}
          <TaskList />
        </div>
      </div>

      <AddTaskFab />

      {/* Modals */}
      <AddTaskModal />
      <EditTaskModal />
      <TaskDetailModal />
      <SubmitWorkModal />
      <TaskPresetsModal />
      <CreateFromPresetModal />
      <ApproveSubmissionModal />
      <RejectSubmissionModal />
      <RejectTaskModal />
    </div>
  );
}
