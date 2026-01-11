"use client";

import React from "react";
import { motion } from "framer-motion";
import { useUserActivityStore } from "../store/useUserActivityStore";
import Search from "@/icons/Search";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function UserActivityFilters() {
  const locale = useLocaleStore((state) => state.locale);
  const { filters, setFilters, clearFilters } = useUserActivityStore();

  const handleFilterChange = (key: string, value: string) => {
    // Update the filters in the store
    setFilters({ [key]: value });
  };

  if (!locale) return null;

  const activityTypes = [
    { value: "all", label: locale.userActivity.filters.activityType.all },
    {
      value: "ticket_answered",
      label: locale.userActivity.filters.activityType.ticketAnswered,
    },
    {
      value: "task_performed",
      label: locale.userActivity.filters.activityType.taskPerformed,
    },
    {
      value: "task_approved",
      label: locale.userActivity.filters.activityType.taskApproved,
    },
    {
      value: "faq_created",
      label: locale.userActivity.filters.activityType.faqCreated,
    },
    {
      value: "faq_updated",
      label: locale.userActivity.filters.activityType.faqUpdated,
    },
    {
      value: "promotion_created",
      label: locale.userActivity.filters.activityType.promotionCreated,
    },
    {
      value: "staff_request_created",
      label: locale.userActivity.filters.activityType.staffRequestCreated,
    },
  ];

  const roles = [
    { value: "all", label: locale.userActivity.filters.role.all },
    { value: "ADMIN", label: locale.userActivity.filters.role.admin },
    { value: "SUPERVISOR", label: locale.userActivity.filters.role.supervisor },
    { value: "EMPLOYEE", label: locale.userActivity.filters.role.employee },
  ];

  const dateRanges = [
    { value: "all", label: locale.userActivity.filters.dateRange.all },
    { value: "today", label: locale.userActivity.filters.dateRange.today },
    { value: "week", label: locale.userActivity.filters.dateRange.week },
    { value: "month", label: locale.userActivity.filters.dateRange.month },
    { value: "quarter", label: locale.userActivity.filters.dateRange.quarter },
    { value: "year", label: locale.userActivity.filters.dateRange.year },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/90  rounded-3xl shadow-xl border border-white/30 p-6 mb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex items-center gap-3 mb-5"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "backOut" }}
          className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Search className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xl font-bold text-slate-800"
        >
          {locale.userActivity.filters.title}
        </motion.h2>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mb-6"
      >
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <Search className="h-5 w-5 text-slate-400" />
          </motion.div>
          <motion.input
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            whileFocus={{
              scale: 1.02,
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
            }}
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-slate-50/50"
            placeholder={locale.userActivity.filters.searchPlaceholder}
          />
        </div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Activity Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {locale.userActivity.filters.activityType.label}
          </label>
          <select
            value={filters.activityType}
            onChange={(e) => handleFilterChange("activityType", e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {locale.userActivity.filters.role.label}
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {locale.userActivity.filters.dateRange.label}
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Clear Filters Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="mt-6 flex justify-end"
      >
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
        >
          {locale.userActivity.filters.clearFilters}
        </button>
      </motion.div>
    </motion.div>
  );
}
