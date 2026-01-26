"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import TeamTaskCard from "./TeamTaskCard";
import TeamTasksDashboard from "./TeamTasksDashboard";
import TeamTasksFilters from "./TeamTasksFilters";
import DetailedTaskCard from "./DetailedTaskCard";
import EditTaskModal from "./EditTaskModal";
import TaskSubmissionApprovalModal from "./TaskSubmissionApprovalModal";
import TaskSubmissionRejectionModal from "./TaskSubmissionRejectionModal";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";
import { useTaskSubmissionsStore } from "../store/useTaskSubmissionsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { FileService, TasksService } from "@/lib/api";
import { TaskStatus } from "@/lib/api/tasks";
import { TaskSubmission } from "@/lib/api";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { TaskService } from "@/lib/api/v2";
import { ExportFileService } from "@/lib/api/v2";
import { env } from "next-runtime-env";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import { useAttachments } from "@/hooks/useAttachments";
import { FileHubAttachment } from "@/lib/api/v2/models/faq";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface TasksPageClientProps {
  initialTasks: any[];
  initialDepartments: any[];
  initialSubDepartments: any[];
  initialAttachments?: any;
  initialFileHubAttachments?: FileHubAttachment[];
  initialMetrics?: {
    pendingCount: number;
    completedCount: number;
    completionPercentage: number;
  };
  initialMeta?: any;
  initialTaskSubmissions?: Record<string, TaskSubmission[]>;
  initialDelegationSubmissions?: Record<string, any[]>;
  initialSubmissionAttachments?: Record<string, string[]>;
  userRole?: string;
  locale: Locale;
  language: string;
}

export default function TasksPageClient({
  initialTasks,
  initialDepartments,
  initialSubDepartments,
  initialAttachments,
  initialFileHubAttachments,
  initialMetrics,
  initialMeta,
  initialTaskSubmissions,
  initialDelegationSubmissions,
  initialSubmissionAttachments,
  userRole,
  locale,
  language,
}: TasksPageClientProps) {
  const { setLocale } = useLocaleStore();
  const {
    tasks,
    setTasks,
    isLoading,
    error,
    meta,
  } = useTaskStore();
  const storeLocale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);
  const { setSubDepartments, setDepartments } = useTaskModalStore();
  const { setTaskAttachments } = useTaskAttachments();
  const { setAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const { addExistingAttachmentToTarget, clearExistingAttachmentsForTarget } =
    useAttachments();
  const {
    setAllTaskSubmissions,
    setAllDelegationSubmissions,
    setAllSubmissionAttachments,
  } = useTaskSubmissionsStore();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const { addToast } = useToastStore();
  const isInitialMount = useRef(true);

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
      const dateRange =
        startDate && endDate
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
      if (!storeLocale) return;
      addToast({
        message: storeLocale.tasks.teamTasks.toasts.exportFailed,
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    // Initialize with server data only once on mount
    setTasks(initialTasks, initialMeta);
    setDepartments(initialDepartments);
    setSubDepartments(initialSubDepartments);
    if (initialAttachments) {
      setTaskAttachments(initialAttachments);
      setAttachments("task", initialAttachments);
    }

    if (initialFileHubAttachments && initialFileHubAttachments.length > 0) {
      const allTargetIds = new Set<string>();

      initialFileHubAttachments?.forEach((attachment) => {
        allTargetIds.add(attachment.targetId);
      });

      allTargetIds.forEach((targetId) => {
        clearExistingAttachmentsForTarget(targetId);
      });
      initialFileHubAttachments.forEach((attachment) => {
        if (!attachment?.targetId) return;
        addExistingAttachmentToTarget(attachment.targetId, {
          fileType: attachment.type,
          originalName: attachment.originalName,
          size: attachment.size,
          expirationDate: attachment.expirationDate,
          id: attachment.id,
          filename: attachment.filename,
          isGlobal: attachment.isGlobal,
          createdAt: attachment.createdAt,
          signedUrl: attachment.signedUrl,
        });
      });
    }
    if (initialTaskSubmissions) {
      setAllTaskSubmissions(initialTaskSubmissions);
    }
    if (initialDelegationSubmissions) {
      setAllDelegationSubmissions(initialDelegationSubmissions);
    }
    if (initialSubmissionAttachments) {
      setAllSubmissionAttachments(initialSubmissionAttachments);
    }
  }, []); // Empty dependency array - only run once on mount

  const fetchTasks = useCallback(
    async (
      statusValue: string,
      priorityValue: string,
      searchValue: string,
      departmentValue: string,
      cursor?: string,
      direction?: "next" | "prev"
    ) => {
      setIsFetchingTasks(true);
      try {
        let response: any;
        let allTasks: any[] = [];
        let allAttachments: any = {};
        let allFileHubAttachments: FileHubAttachment[] = [];
        let combinedMetrics: any = null;
        let combinedMeta: any = null;

        const submissions: Record<string, TaskSubmission[]> = {};
        const delegationSubs: Record<string, any[]> = {};
        const submissionAtts: Record<string, string[]> = {};

        const processSubmissions = (subs: any[]) => {
          (subs || []).forEach((sub: any) => {
            if (!submissions[sub.taskId]) submissions[sub.taskId] = [];
            submissions[sub.taskId].push(sub);

            if (sub.delegationSubmission) {
              if (!delegationSubs[sub.taskId]) delegationSubs[sub.taskId] = [];
              delegationSubs[sub.taskId].push(sub.delegationSubmission);
            }
          });
        };

        if (userRole === "ADMIN") {
          response = await TasksService.getDepartmentLevel(
            statusValue ? (statusValue as TaskStatus) : undefined,
            priorityValue
              ? (priorityValue.toUpperCase() as "LOW" | "MEDIUM" | "HIGH")
              : undefined,
            searchValue || undefined,
            departmentValue || undefined,
            cursor,
            direction
          );
          allTasks = response.data;
          allAttachments = response.attachments;
          allFileHubAttachments = response.fileHubAttachments || [];
          combinedMetrics = response.metrics;
          combinedMeta = response.meta;
          processSubmissions(response.submissions);
        } else if (userRole === "SUPERVISOR") {
          response = await TasksService.getTeamTasks(
            statusValue ? statusValue as TaskStatus : undefined,
            priorityValue
              ? priorityValue.toUpperCase() as "LOW" | "MEDIUM" | "HIGH"
              : undefined,
            cursor,
            direction
          );

          allTasks = response.data;
          allFileHubAttachments = response.fileHubAttachments;
          combinedMetrics = {
            pendingCount: response.metrics.pendingTasks,
            completedCount: response.metrics.completedTasks,
            completionPercentage: response.metrics.taskCompletionPercentage,
          };
          combinedMeta = response.meta;
        }

        setTasks(allTasks, combinedMeta);
        if (allFileHubAttachments.length > 0) {
          const allTargetIds = new Set<string>();
          allFileHubAttachments.forEach((attachment) => {
            allTargetIds.add(attachment.targetId);
          });
          allTargetIds.forEach((targetId) => {
            clearExistingAttachmentsForTarget(targetId);
          });
          allFileHubAttachments.forEach((attachment) => {
            if (!attachment?.targetId) return;
            addExistingAttachmentToTarget(attachment.targetId, {
              fileType: attachment.type,
              originalName: attachment.originalName,
              size: attachment.size,
              expirationDate: attachment.expirationDate,
              id: attachment.id,
              filename: attachment.filename,
              isGlobal: attachment.isGlobal,
              createdAt: attachment.createdAt,
              signedUrl: attachment.signedUrl,
            });
          });
        }
        setTaskAttachments(allAttachments);
        setAttachments("task", allAttachments);
        setAllTaskSubmissions(submissions);
        setAllDelegationSubmissions(delegationSubs);
        setAllSubmissionAttachments(submissionAtts);
        if (combinedMetrics) {
          setMetrics(combinedMetrics);
        }

        // Prefill metadata cache
        const allIds: string[] = Object.values(allAttachments)
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
      } catch (error) {
        if (!storeLocale) return;
        addToast({
          message: storeLocale.tasks.teamTasks.toasts.fetchFailed,
          type: "error",
        });
      } finally {
        setIsFetchingTasks(false);
      }
    },
    [
      userRole,
      addToast,
      setTaskAttachments,
      setAttachments,
      setAllTaskSubmissions,
      setAllDelegationSubmissions,
      setAllSubmissionAttachments,
      setMetadata,
    ]
  );

  // Debounced search effect - only fetch when filters actually change (not on initial mount)
  useEffect(() => {
    // Skip fetch on initial mount since we already have initialTasks
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchTasks(statusFilter, priorityFilter, searchTerm, departmentFilter);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, priorityFilter, departmentFilter]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handlePriorityChange = (value: string) => {
    setPriorityFilter(value);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (!storeLocale) return null;

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
                      {storeLocale?.tasks.teamTasks.pageHeader.title || "Team Tasks"}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="text-sm text-slate-600"
                    >
                      {storeLocale?.tasks.teamTasks.pageHeader.count
                        .replace("{count}", tasks.length.toString())
                        .replace("{plural}", tasks.length !== 1 ? "s" : "") || `${tasks.length} task${tasks.length !== 1 ? "s" : ""} available`}
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
                          <label className="text-xs text-slate-500 mb-1">
                            {storeLocale?.tasks.teamTasks.export.startDate || "Start Date (Optional)"}
                          </label>
                          <input
                            type="date"
                            value={startDate ?? ""}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-slate-500 mb-1">
                            {storeLocale?.tasks.teamTasks.export.endDate || "End Date (Optional)"}
                          </label>
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
                          {isExporting
                            ? storeLocale?.tasks.teamTasks.export.exporting || "Exporting..."
                            : storeLocale?.tasks.teamTasks.export.export || "Export"}
                        </button>
                        <button
                          onClick={() => {
                            setShowExportForm(false);
                            setStartDate(null);
                            setEndDate(null);
                          }}
                          className="px-3 py-1.5 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {storeLocale?.tasks.teamTasks.export.cancel || "Cancel"}
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
                        {storeLocale?.tasks.teamTasks.export.button || "Export Tasks"}
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
                {metrics && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.2 },
                    }}
                    className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
                  >
                    <TeamTasksDashboard
                      total={metrics.completedCount + metrics.pendingCount}
                      completedCount={metrics.completedCount}
                      pendingCount={metrics.pendingCount}
                      completionPercentage={metrics.completionPercentage}
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
                  className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
                >
                  <TeamTasksFilters
                    search={searchTerm}
                    status={statusFilter}
                    priority={priorityFilter}
                    department={departmentFilter}
                    departments={initialDepartments}
                    isLoading={isFetchingTasks}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    onDepartmentChange={handleDepartmentChange}
                  />
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
                className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
              >
                {isFetchingTasks ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                    <p className="mt-4 text-sm text-slate-500">
                      {storeLocale?.tasks.teamTasks.loading || "Loading tasks..."}
                    </p>
                  </div>
                ) : tasks.length === 0 ? (
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
                          {storeLocale?.tasks.teamTasks.empty.title || "No tasks found"}
                        </p>
                        <p className="text-sm">
                          {storeLocale?.tasks.teamTasks.empty.hint || "Try adjusting your search or filter criteria"}
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task: any, index: number) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(0.1 + index * 0.02, 0.5),
                          ease: "easeOut",
                        }}
                        whileHover={{
                          y: -2,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <TeamTaskCard task={task} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {meta && (meta.hasNextPage || meta.hasPrevPage) && (
                  <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={() =>
                        fetchTasks(
                          statusFilter,
                          priorityFilter,
                          searchTerm,
                          departmentFilter,
                          meta.prevCursor,
                          "prev"
                        )
                      }
                      disabled={!meta.hasPrevPage || isFetchingTasks}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      {(storeLocale?.tasks.teamTasks as any).pagination?.previous ||
                        "Previous"}
                    </button>
                    <button
                      onClick={() =>
                        fetchTasks(
                          statusFilter,
                          priorityFilter,
                          searchTerm,
                          departmentFilter,
                          meta.nextCursor,
                          "next"
                        )
                      }
                      disabled={!meta.hasNextPage || isFetchingTasks}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {(storeLocale?.tasks.teamTasks as any).pagination?.next || "Next"}
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
      <DetailedTaskCard />
      <EditTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
      <TaskSubmissionApprovalModal />
      <TaskSubmissionRejectionModal />
    </>
  );
}
