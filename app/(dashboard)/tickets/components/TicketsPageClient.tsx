"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import ReplyToTicketModal from "./ReplyToTicketModal";
import {
  Ticket,
  TicketMetrics,
  TicketsService,
  UserResponse,
  TicketStatus,
  SupportTicket,
} from "@/lib/api";
import { useTicketStore } from "../store/useTicketStore";
import TicketsDashboard from "./TicketsDashboard";
import TicketsFilters from "./TicketsFilters";
import TicketsList from "./TicketsList";
import { ExportFileService } from "@/lib/api/v2";
import { env } from "next-runtime-env";
import { useToastStore } from "../../store/useToastStore";
import api from "@/lib/api";
import { Department } from "@/lib/api/departments";
import { FileHubAttachment } from "@/lib/api/v2/services/shared/filehub";
import { useAttachments } from "@/hooks/useAttachments";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface TicketsPageClientProps {
  initialTickets: SupportTicket[];
  initialAttachments: FileHubAttachment[];
  initialMetrics: TicketMetrics;
  departments: Department[];
  locale: Locale;
  language: string;
}

export default function TicketsPageClient({
  initialTickets,
  initialAttachments,
  initialMetrics,
  departments,
  locale,
  language,
}: TicketsPageClientProps) {
  const { tickets, setTickets } = useTicketStore();
  const [metrics, setMetrics] = useState<TicketMetrics>(initialMetrics);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const latestStatusRef = useRef("");
  const latestDepartmentRef = useRef("");
  const didMountSearchRef = useRef(false);
  const { addToast } = useToastStore();
  const { setLocale } = useLocaleStore();
  const {
    clearExistingAttachmentsForTarget,
    addExistingAttachmentToTarget,
    upsertExistingAttachmentForTarget,
  } = useAttachments();

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);

  // Fetch user to check admin status
  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  // Initialize with server data
  useEffect(() => {
    setTickets(initialTickets);
    const allTargetIds = new Set<string>();

    initialAttachments?.forEach((attachment) => {
      if (!attachment.targetId) return;
      allTargetIds.add(attachment.targetId);
    });

    allTargetIds.forEach((targetId) => {
      clearExistingAttachmentsForTarget(targetId);
    });
    initialAttachments?.forEach((attachment) => {
      if (!attachment.targetId) return;
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
  }, [initialTickets, setTickets]);

  const fetchTickets = useCallback(
    async (
      statusValue: string,
      departmentValue: string,
      searchValue: string
    ) => {
      setIsFetchingTickets(true);
      try {
        const response = await TicketsService.getAllTickets(
          statusValue ? (statusValue as TicketStatus) : undefined,
          departmentValue || undefined,
          searchValue || undefined
        );

        setTickets(response.tickets);
        setMetrics({
          totalTickets: response.metrics.totalTickets,
          pendingTickets: response.metrics.pendingTickets,
          answeredTickets: response.metrics.answeredTickets,
          closedTickets: response.metrics.closedTickets,
        });
        response.attachments.forEach((attachment) => {
          upsertExistingAttachmentForTarget(attachment.targetId, {
            fileType: attachment.type,
            originalName: attachment.originalName,
            size: attachment.size,
            expirationDate: attachment.expirationDate,
            id: attachment.id,
            filename: attachment.filename,
            isGlobal: attachment.isGlobal,
            createdAt: attachment.createdAt,
            signedUrl: attachment.signedUrl,
            targetId: attachment.targetId,
            userId: attachment.userId,
          });
        });
      } catch (error) {
        const { locale: storeLocale } = useLocaleStore.getState();
        addToast({
          message:
            storeLocale?.tickets?.toasts?.fetchError ||
            "Failed to fetch tickets for the selected filters. Please try again.",
          type: "error",
        });
      } finally {
        setIsFetchingTickets(false);
      }
    },
    [addToast, setTickets]
  );

  useEffect(() => {
    latestStatusRef.current = statusFilter;
  }, [statusFilter]);

  useEffect(() => {
    latestDepartmentRef.current = departmentFilter;
  }, [departmentFilter]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    latestStatusRef.current = value;
    fetchTickets(value, departmentFilter, searchTerm);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
    latestDepartmentRef.current = value;
    fetchTickets(statusFilter, value, searchTerm);
  };

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return;
    }

    const handler = setTimeout(() => {
      fetchTickets(
        latestStatusRef.current,
        latestDepartmentRef.current,
        searchTerm
      );
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, fetchTickets]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Step 1: Call exportTickets (dates are optional)
      const exportResponse = await TicketsService.exportTickets(
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
      const filename = `tickets-export-${dateRange}.${exportResponse.type.toLowerCase()}`;

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
      const { locale: storeLocale } = useLocaleStore.getState();
      addToast({
        message:
          storeLocale?.tickets?.toasts?.exportError ||
          "Failed to export tickets. Please try again.",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
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
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
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
                  {locale.tickets.pageHeader.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-sm text-slate-600"
                >
                  {locale.tickets.pageHeader.ticketsAvailable
                    .replace("{count}", tickets.length.toString())
                    .replace("{plural}", tickets.length !== 1 ? "s" : "")}
                </motion.p>
              </div>
            </div>
            {user?.role === "ADMIN" && (
              <div className="flex items-center gap-3">
                {showExportForm && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex flex-col">
                      <label className="text-xs text-slate-500 mb-1">
                        {locale.tickets.export.startDate}
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
                        {locale.tickets.export.endDate}
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
                        ? locale.tickets.export.exporting
                        : locale.tickets.export.export}
                    </button>
                    <button
                      onClick={() => {
                        setShowExportForm(false);
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      className="px-3 py-1.5 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors"
                    >
                      {locale.tickets.export.cancel}
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
                    Export Tickets
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
              <TicketsDashboard {...metrics} />
            </motion.div>

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
              <TicketsFilters
                search={searchTerm}
                status={statusFilter}
                department={departmentFilter}
                departments={departments}
                isLoading={isFetchingTickets}
                onSearchChange={setSearchTerm}
                onStatusChange={handleStatusChange}
                onDepartmentChange={handleDepartmentChange}
              />
            </motion.div>
          </div>

          {/* Right Column - Tickets List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{
              y: -2,
              transition: { duration: 0.2 },
            }}
            className="bg-white/90  rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            {isFetchingTickets ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <p className="mt-4 text-sm text-slate-500">
                  {locale.tickets.loading.loadingTickets}
                </p>
              </div>
            ) : (
              <TicketsList tickets={tickets} />
            )}
          </motion.div>
        </motion.div>

        <ReplyToTicketModal />
      </div>
    </motion.div>
  );
}
