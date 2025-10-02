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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      Team Tasks
                    </h2>
                    <p className="text-sm text-slate-600">
                      {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8">
              {/* Left Column - Dashboard and Filters */}
              <div className="space-y-6">
                {/* Dashboard */}
                {initialMetrics && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <TeamTasksDashboard
                      total={tasks.length}
                      completedCount={initialMetrics.completedCount}
                      pendingCount={initialMetrics.pendingCount}
                      completionPercentage={initialMetrics.completionPercentage}
                    />
                  </div>
                )}

                {/* Filters */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <TeamTasksFilters onFilterChange={handleFilterChange} />
                </div>
              </div>

              {/* Right Column - Tasks List */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {filteredTasks.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <div className="text-slate-500">
                        <p className="text-lg font-medium mb-2">No tasks found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </div>
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
          </div>
        </div>
      )}
      <DetailedTaskCard />
      <EditTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
    </>
  );
}
