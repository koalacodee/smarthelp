"use client";

import { useGroupedFAQsStore } from "../store/useGroupedFAQsStore";
import { useMemo } from "react";

export default function FaqsFilters() {
  const { filters, setFilters, clearFilters, faqs } = useGroupedFAQsStore();

  // Get unique departments for filter dropdown
  const departments = useMemo(() => {
    return faqs.map((group) => ({
      id: group.departmentId,
      name: group.departmentName,
    }));
  }, [faqs]);

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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Filters & Search
            </h3>
            <p className="text-sm text-slate-500">Refine your search results</p>
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="group relative px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-all duration-200 hover:bg-blue-50 rounded-lg"
        >
          <span className="relative z-10 flex items-center gap-2">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear All
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
            placeholder="Search FAQs by question or department..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Department
          </label>
          <div className="relative">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Sort By
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="text">Question Text</option>
              <option value="department">Department</option>
              <option value="views">Views</option>
              <option value="satisfaction">Satisfaction</option>
              <option value="dissatisfaction">Dissatisfaction</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
            </div>
          </div>
        </div>
      </div>

      {/* Sort Order Toggle */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Sort Order:</span>
        <button
          onClick={() => handleSortChange(filters.sortBy)}
          className={`group relative px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2 ${
            filters.sortOrder === "asc"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/25"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
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
            {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
          </span>
        </button>
      </div>
    </div>
  );
}
