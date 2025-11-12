"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TeamTaskCard from "./TeamTaskCard";
import TeamTasksDashboard from "./TeamTasksDashboard";
import TeamTasksFilters from "./TeamTasksFilters";
import DetailedTaskCard from "./DetailedTaskCard";
import EditTaskModal from "./EditTaskModal";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";
import { useTaskSubmissionsStore } from "../store/useTaskSubmissionsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { FileService } from "@/lib/api";
import { TaskSubmission } from "@/lib/api";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { TaskService } from "@/lib/api/v2";
import { ExportFileService } from "@/lib/api/v2";
import { env } from "next-runtime-env";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";

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
  const { setAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const { setAllTaskSubmissions, setAllSubmissionAttachments } =
    useTaskSubmissionsStore();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const { addToast } = useToastStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Step 1: Call exportTickets (dates are optional)
      const exportResponse = await TaskService.exportTickets(
        startDate ?? undefined,
        endDate ?? undefined
      );

      // Step 2: Get the identifier (id from the response)
      const identifier = exportResponse.id;

      // Step 3: Check NEXT_PUBLIC_MEDIA_ACCESS_TYPE and construct/download URL accordingly
      const mediaAccessType = env("NEXT_PUBLIC_MEDIA_ACCESS_TYPE");

      // Generate filename with date range if provided
      const dateRange = startDate && endDate
        ? `${startDate}-${endDate}`
        : startDate
          ? `from-${startDate}`
          : endDate
            ? `until-${endDate}`
            : "all";
      const filename = `tasks-export-${dateRange}.${exportResponse.type.toLowerCase()}`;

      let downloadUrl: string;

      if (mediaAccessType === "signed-url") {
        // Get signed URL from API
        const signedUrlResponse = await ExportFileService.getSignedExportUrl(
          identifier
        );
        downloadUrl = signedUrlResponse.signedUrl;
      } else {
        // Construct stream URL directly (matching downloadExport route)
        const baseURL = api.client.defaults.baseURL;
        downloadUrl = `${baseURL}/exports/files/${identifier}/stream`;
      }

      // Let browser handle the download directly from the URL
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportForm(false);
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      console.error("Export failed:", error);
      addToast({
        message: "Failed to export tasks. Please try again.",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    // Initialize with server data only once on mount
    setTasks(initialTasks);
    setDepartments(initialDepartments);
    setSubDepartments(initialSubDepartments);
    if (initialAttachments) {
      setTaskAttachments(initialAttachments);
      setAttachments("task", initialAttachments);
      // Prefill metadata cache so names/previews show immediately
      const allIds: string[] = Object.values(initialAttachments)
        .flat()
        .filter(Boolean) as string[];
      if (allIds.length > 0) {
        Promise.all(
          allIds.map((id) =>
            FileService.getAttachmentMetadata(id)
              .then((m) => setMetadata(id, m))
              .catch(() => null)
          )
        );
      }
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
                  >
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
                  </motion.div>
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="text-lg font-semibold text-slate-800"
                    >
                      Team Tasks
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="text-sm text-slate-600"
                    >
                      {filteredTasks.length} task
                      {filteredTasks.length !== 1 ? "s" : ""} available
                    </motion.p>
                  </div>
                </div>
                {userRole === "ADMIN" && (
                  <div className="flex items-center gap-3">
                    {showExportForm && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex flex-col">
                          <label className="text-xs text-slate-500 mb-1">Start Date (Optional)</label>
                          <input
                            type="date"
                            value={startDate ?? ""}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-slate-500 mb-1">End Date (Optional)</label>
                          <input
                            type="date"
                            value={endDate ?? ""}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleExport}
                          disabled={isExporting}
                          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isExporting ? "Exporting..." : "Export"}
                        </button>
                        <button
                          onClick={() => {
                            setShowExportForm(false);
                            setStartDate(null);
                            setEndDate(null);
                          }}
                          className="px-3 py-1.5 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}
                    {!showExportForm && (
                      <button
                        onClick={() => setShowExportForm(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export Tasks
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8"
            >
              {/* Left Column - Dashboard and Filters */}
              <div className="space-y-6">
                {/* Dashboard */}
                {initialMetrics && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.2 },
                    }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                  >
                    <TeamTasksDashboard
                      total={tasks.length}
                      completedCount={initialMetrics.completedCount}
                      pendingCount={initialMetrics.pendingCount}
                      completionPercentage={initialMetrics.completionPercentage}
                    />
                  </motion.div>
                )}

                {/* Filters */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                >
                  <TeamTasksFilters onFilterChange={handleFilterChange} />
                </motion.div>
              </div>

              {/* Right Column - Tasks List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
              >
                {filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="px-6 py-16 text-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 }}
                      className="flex flex-col items-center justify-center space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 1,
                          ease: "backOut",
                        }}
                        className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center"
                      >
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
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 1.1 }}
                        className="text-slate-500"
                      >
                        <p className="text-lg font-medium mb-2">
                          No tasks found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or filter criteria
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task: any, index: number) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.8 + index * 0.05,
                          ease: "easeOut",
                        }}
                        whileHover={{
                          y: -2,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <TeamTaskCard task={task} userRole={userRole} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
      <DetailedTaskCard />
      <EditTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
    </>
  );
}
