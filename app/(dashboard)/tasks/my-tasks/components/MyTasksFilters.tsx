"use client";

import { useMyTasksStore } from "../store/useMyTasksStore";

export default function MyTasksFilters() {
  const { filters, setFilters, clearFilters } = useMyTasksStore();

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">
        Filters &amp; Search
      </h3>
      <input
        type="text"
        value={filters.search}
        onChange={(e) => handleFilterChange("search", e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6]"
        placeholder="Search tasks..."
      />
      <div className="mt-5">
        <label className="block mb-1 text-xs text-[#4a5568]">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]"
        >
          <option>All</option>
          <option>Completed</option>
          <option>In Progress</option>
          <option>Pending Review</option>
          <option>Seen</option>
          <option>Rejected</option>
        </select>
        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          Priority
        </label>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]"
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <button
          onClick={clearFilters}
          className="w-full mt-4 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
