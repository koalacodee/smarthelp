"use client";

import { useMyTasksStore } from "../store/useMyTasksStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface DepartmentOption {
  id: string;
  name: string;
}

interface MyTasksFiltersProps {
  userRole?: string;
  initialDepartments?: DepartmentOption[];
  initialSubDepartments?: DepartmentOption[];
}

export default function MyTasksFilters({
  userRole = "",
  initialDepartments = [],
  initialSubDepartments = [],
}: MyTasksFiltersProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { filters, setFilters, clearFilters } = useMyTasksStore();

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const showDepartmentFilter =
    (userRole === "SUPERVISOR" && initialDepartments.length > 0) ||
    (userRole === "EMPLOYEE" && initialSubDepartments.length > 0);
  const departmentOptions =
    userRole === "SUPERVISOR" ? initialDepartments : initialSubDepartments;
  const departmentFilterKey =
    userRole === "SUPERVISOR" ? "departmentId" : "subDepartmentId";
  const departmentFilterValue =
    userRole === "SUPERVISOR"
      ? filters.departmentId
      : filters.subDepartmentId;

  if (!locale) return null;

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">
        {locale.tasks.myTasks.filters.title}
      </h3>
      <input
        type="text"
        value={filters.search}
        onChange={(e) => handleFilterChange("search", e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6]"
        placeholder={locale.tasks.myTasks.filters.searchPlaceholder}
      />
      <div className="mt-5">
        {showDepartmentFilter && (
          <>
            <label className="block mb-1 text-xs text-[#4a5568]">
              {(locale.tasks.myTasks.filters as { department?: { label?: string; all?: string } })?.department?.label ?? "Department"}
            </label>
            <select
              value={departmentFilterValue}
              onChange={(e) =>
                handleFilterChange(departmentFilterKey, e.target.value)
              }
              className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] mb-4"
            >
              <option value="">
                {(locale.tasks.myTasks.filters as { department?: { all?: string } })?.department?.all ?? "All"}
              </option>
              {departmentOptions.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </>
        )}
        <label className="block mb-1 text-xs text-[#4a5568]">{locale.tasks.myTasks.filters.status.label}</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]"
        >
          <option>{locale.tasks.myTasks.filters.status.all}</option>
          <option>{locale.tasks.myTasks.filters.status.completed}</option>
          <option>In Progress</option>
          <option>{locale.tasks.myTasks.filters.status.pendingReview}</option>
          <option>{locale.tasks.myTasks.filters.status.seen}</option>
        </select>
        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          {locale.tasks.myTasks.filters.priority.label}
        </label>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]"
        >
          <option>{locale.tasks.myTasks.filters.priority.all}</option>
          <option>{locale.tasks.myTasks.filters.priority.high}</option>
          <option>{locale.tasks.myTasks.filters.priority.medium}</option>
          <option>{locale.tasks.myTasks.filters.priority.low}</option>
        </select>
        <button
          onClick={clearFilters}
          className="w-full mt-4 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {locale.tasks.myTasks.clearFilters}
        </button>
      </div>
    </div>
  );
}
