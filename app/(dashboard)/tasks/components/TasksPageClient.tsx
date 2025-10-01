"use client";

import { useEffect, useState } from "react";
import TeamTaskCard from "./TeamTaskCard";
import TeamTasksDashboard from "./TeamTasksDashboard";
import TeamTasksFilters from "./TeamTasksFilters";
import DetailedTaskCard from "./DetailedTaskCard";
import EditTaskModal from "./EditTaskModal";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";
import { useTaskSubmissionsStore } from "../store/useTaskSubmissionsStore";
import { TaskSubmission } from "@/lib/api";

interface TasksPageClientProps {
  initialTasks: any[];
  initialDepartments: any[];
  initialSubDepartments: any[];
  initialAttachments?: any;
  initialMetrics?: {
    pendingCount: number;
    completedCount: number;
    completionPercentage: number;
  };
  initialTaskSubmissions?: Record<string, TaskSubmission[]>;
  initialSubmissionAttachments?: Record<string, string[]>;
  userRole?: string;
}

export default function TasksPageClient({
  initialTasks,
  initialDepartments,
  initialSubDepartments,
  initialAttachments,
  initialMetrics,
  initialTaskSubmissions,
  initialSubmissionAttachments,
  userRole,
}: TasksPageClientProps) {
  const {
    tasks,
    filteredTasks,
    filters,
    setTasks,
    setFilters,
    isLoading,
    error,
  } = useTaskStore();
  const { setSubDepartments, setDepartments } = useTaskModalStore();
  const { setTaskAttachments } = useTaskAttachments();
  const { setAllTaskSubmissions, setAllSubmissionAttachments } =
    useTaskSubmissionsStore();

  useEffect(() => {
    // Initialize with server data only once on mount
    setTasks(initialTasks);
    setDepartments(initialDepartments);
    setSubDepartments(initialSubDepartments);
    if (initialAttachments) {
      setTaskAttachments(initialAttachments);
    }
    if (initialTaskSubmissions) {
      setAllTaskSubmissions(initialTaskSubmissions);
    }
    if (initialSubmissionAttachments) {
      setAllSubmissionAttachments(initialSubmissionAttachments);
    }
  }, []); // Empty dependency array - only run once on mount

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-5 max-w-[1400px] mx-auto">
          {/* Left Column - Dashboard and Filters */}
          <div className="space-y-5">
            {/* Dashboard */}
            {initialMetrics && (
              <TeamTasksDashboard
                total={tasks.length}
                completedCount={initialMetrics.completedCount}
                pendingCount={initialMetrics.pendingCount}
                completionPercentage={initialMetrics.completionPercentage}
              />
            )}

            {/* Filters */}
            <TeamTasksFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Right Column - Tasks List */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found
              </div>
            ) : (
              <div className="space-y-0">
                {filteredTasks.map((task: any) => (
                  <TeamTaskCard key={task.id} task={task} userRole={userRole} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <DetailedTaskCard />
      <EditTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
    </>
  );
}
