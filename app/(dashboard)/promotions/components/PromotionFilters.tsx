"use client";

import { motion } from "framer-motion";
import { usePromotionsStore } from "../store/usePromotionsStore";
import { AudienceType } from "@/lib/api/v2/services/promotion";

export default function PromotionFilters() {
  const { filters, setFilters, clearFilters } = usePromotionsStore();

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const handleSortChange = (sortBy: string) => {
    // Toggle sort order if same field is clicked, otherwise set to asc
    const newOrder =
      filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc";
    setFilters({ sortBy, sortOrder: newOrder });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 },
      }}
      className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6 mb-6 transition-all duration-300 hover:shadow-2xl"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "backOut" }}
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
              />
            </svg>
          </motion.div>
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-lg font-semibold text-slate-800"
            >
              Filters & Search
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="text-sm text-slate-500"
            >
              Refine your promotion results
            </motion.p>
          </div>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearFilters}
          className="group relative px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-all duration-200 hover:bg-purple-50 rounded-lg"
        >
          <span className="relative z-10 flex items-center gap-2">
            <motion.svg
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </motion.svg>
            Clear All
          </span>
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="mb-6"
      >
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.div>
          <motion.input
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-slate-50/50"
            placeholder="Search promotions by title..."
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Audience Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="space-y-2"
        >
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 1.3 }}
            className="block text-sm font-medium text-slate-700"
          >
            Audience
          </motion.label>
          <div className="relative">
            <motion.select
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.4 }}
              whileFocus={{ scale: 1.02 }}
              value={filters.audience}
              onChange={(e) => handleFilterChange("audience", e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">All Audiences</option>
              <option value={AudienceType.ALL}>All</option>
              <option value={AudienceType.CUSTOMER}>Customer</option>
              <option value={AudienceType.SUPERVISOR}>Supervisor</option>
              <option value={AudienceType.EMPLOYEE}>Employee</option>
            </motion.select>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 1.5 }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="space-y-2"
        >
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 1.3 }}
            className="block text-sm font-medium text-slate-700"
          >
            Status
          </motion.label>
          <div className="relative">
            <motion.select
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.4 }}
              whileFocus={{ scale: 1.02 }}
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </motion.select>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 1.5 }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Sort By */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="space-y-2"
        >
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 1.3 }}
            className="block text-sm font-medium text-slate-700"
          >
            Sort By
          </motion.label>
          <div className="relative">
            <motion.select
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.4 }}
              whileFocus={{ scale: 1.02 }}
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="title">Title</option>
              <option value="audience">Audience</option>
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="createdAt">Created Date</option>
            </motion.select>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 1.5 }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Sort Order Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.6 }}
        className="mt-6 flex items-center justify-between"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 1.7 }}
          className="text-sm font-medium text-slate-700"
        >
          Sort Order:
        </motion.span>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSortChange(filters.sortBy)}
          className={`group relative px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2 ${
            filters.sortOrder === "asc"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-transparent shadow-lg shadow-purple-500/25"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            <motion.div
              animate={{ rotate: filters.sortOrder === "asc" ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {filters.sortOrder === "asc" ? (
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
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </motion.div>
            {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
