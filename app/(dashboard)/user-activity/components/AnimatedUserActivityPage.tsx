"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import UserActivityReport from "./UserActivityReport";
import UserPerformanceTable from "./UserPerformanceTable";
import { PerformanceUser, PerformanceTicket } from "./UserPerformanceTable";
import { ApiResponse, ActivityItem } from "./UserActivityReport";
import AnalyticsInsights from "@/icons/AnalyticsInsights";
import UserActivityFilters from "./UserActivityFilters";
import { useUserActivityStore } from "../store/useUserActivityStore";

interface AnimatedUserActivityPageProps {
  report: ApiResponse;
  users: PerformanceUser[];
  tickets: PerformanceTicket[];
}

export default function AnimatedUserActivityPage({
  report,
  users,
  tickets,
}: AnimatedUserActivityPageProps) {
  const { filters } = useUserActivityStore();

  // Filter users based on search and role filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter by role
      if (filters.role !== "all" && user.role !== filters.role) {
        return false;
      }

      // Filter by search term
      if (
        filters.search &&
        !user.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [users, filters.search, filters.role]);

  // Filter tickets based on search, role, activity type, and date range
  const filteredTickets = useMemo(() => {
    if (
      !filters.search &&
      filters.role === "all" &&
      filters.activityType === "all" &&
      filters.dateRange === "all"
    ) {
      return tickets;
    }

    return tickets.filter((ticket) => {
      // If we have filtered users and this ticket belongs to a user, check if user is filtered
      if (ticket.answeredByUserId && filters.role !== "all") {
        const user = users.find((u) => u.id === ticket.answeredByUserId);
        if (!user || user.role !== filters.role) {
          return false;
        }
      }

      // Filter by date range if needed
      if (filters.dateRange !== "all") {
        // This would require actual date data on tickets which we don't have in the current model
        // For now, we'll skip this filter since we don't have the data
      }

      return true;
    });
  }, [tickets, users, filters]);

  // Filter activity report data based on filters
  const filteredReport = useMemo(() => {
    // If no filters are applied, return the original report
    if (
      !filters.search &&
      filters.role === "all" &&
      filters.activityType === "all" &&
      filters.dateRange === "all"
    ) {
      return report;
    }

    // Create a deep copy to avoid mutating the original data
    const filteredData = {
      ...report,
      data: {
        ...report.data,
        data: [...(report.data.data || [])],
      },
    };

    // Handle empty data case
    if (!filteredData.data.data || !Array.isArray(filteredData.data.data)) {
      filteredData.data.data = [];
      return filteredData;
    }

    // Filter by activity type
    if (filters.activityType !== "all") {
      filteredData.data.data = filteredData.data.data.filter(
        (group) => group.type === filters.activityType
      );
    }

    // Filter activities within each group
    if (filteredData.data.data.length > 0) {
      filteredData.data.data = filteredData.data.data.map((group) => {
        // Handle case where group.activities is undefined or not an array
        if (!group.activities || !Array.isArray(group.activities)) {
          return { ...group, activities: [] };
        }

        const filteredActivities = group.activities.filter(
          (activity: ActivityItem) => {
            // Filter by search term
            if (
              filters.search &&
              !activity.title
                ?.toLowerCase()
                .includes(filters.search.toLowerCase()) &&
              !activity.user?.name
                ?.toLowerCase()
                .includes(filters.search.toLowerCase())
            ) {
              return false;
            }

            // Filter by role
            if (filters.role !== "all") {
              const user = users.find((u) => u.id === activity.userId);
              if (!user || user.role !== filters.role) {
                return false;
              }
            }

            // Filter by date range
            if (filters.dateRange !== "all" && activity.occurredAt) {
              const activityDate = new Date(activity.occurredAt);
              const now = new Date();

              switch (filters.dateRange) {
                case "today":
                  if (activityDate.toDateString() !== now.toDateString()) {
                    return false;
                  }
                  break;
                case "week":
                  const weekAgo = new Date();
                  weekAgo.setDate(now.getDate() - 7);
                  if (activityDate < weekAgo) {
                    return false;
                  }
                  break;
                case "month":
                  const monthAgo = new Date();
                  monthAgo.setMonth(now.getMonth() - 1);
                  if (activityDate < monthAgo) {
                    return false;
                  }
                  break;
                case "quarter":
                  const quarterAgo = new Date();
                  quarterAgo.setMonth(now.getMonth() - 3);
                  if (activityDate < quarterAgo) {
                    return false;
                  }
                  break;
                case "year":
                  const yearAgo = new Date();
                  yearAgo.setFullYear(now.getFullYear() - 1);
                  if (activityDate < yearAgo) {
                    return false;
                  }
                  break;
              }
            }

            return true;
          }
        );

        return {
          ...group,
          activities: filteredActivities,
        };
      });
    }

    return filteredData;
  }, [report, filters, users]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 relative overflow-hidden"
    >
      {/* Background Animation Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.7 }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.9 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-2xl"
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: "backOut",
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.3 },
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
            >
              <AnalyticsInsights className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: "easeOut",
              }}
              className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
            >
              User Activity & Performance
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              Monitor user performance metrics, activity analytics, and team
              productivity insights
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-4 text-sm text-slate-500"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{filteredUsers.length} Active Users</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span>{filteredTickets.length} Total Activities</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Filters Section */}
        <UserActivityFilters />

        {/* Performance Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: "easeOut",
          }}
          whileHover={{
            y: -3,
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: "backOut" }}
                className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </motion.svg>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-xl font-bold text-slate-800 flex items-center gap-2"
              >
                User Performance Analytics
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9, ease: "backOut" }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                >
                  {filteredUsers.length}
                </motion.span>
              </motion.h2>
            </motion.div>
            <UserPerformanceTable
              users={filteredUsers}
              tickets={filteredTickets}
            />
          </motion.div>
        </motion.div>

        {/* Activity Report Section */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: "easeOut",
          }}
          whileHover={{
            y: -2,
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: "backOut" }}
                className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </motion.svg>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-xl font-bold text-slate-800 flex items-center gap-2"
              >
                Activity Report
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9, ease: "backOut" }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                >
                  {filteredReport.data.data &&
                  Array.isArray(filteredReport.data.data)
                    ? filteredReport.data.data.reduce(
                        (total, group) =>
                          total + (group.activities?.length || 0),
                        0
                      )
                    : 0}
                </motion.span>
              </motion.h2>
            </motion.div>
            <UserActivityReport report={filteredReport} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
