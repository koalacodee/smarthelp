"use client";

import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useTaskStore } from "@/services/tasks/store";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { TaskStatus } from "@/services/tasks/types";

export default function MyTasksFilters() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeFilters, setFilters } = useTaskStore();
  const { role, departments, subDepartments, resetCursor } =
    useV2TaskPageStore();

  if (!locale) return null;

  const filterLabels = locale.tasks.myTasks?.filters ?? {
    status: { label: "Status", all: "All" },
    search: "Search",
  };
  const departmentList = role === "supervisor" ? departments : subDepartments;

  const handleChange = (patch: Parameters<typeof setFilters>[0]) => {
    setFilters(patch);
    resetCursor();
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">
        {locale.tasks.myTasks?.filters?.title ?? "Filters"}
      </h3>
      <input
        type="text"
        value={activeFilters.search ?? ""}
        onChange={(e) => handleChange({ search: e.target.value })}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
        placeholder={
          locale.tasks.myTasks?.filters?.searchPlaceholder ?? "Search tasks..."
        }
      />
      <div className="mt-5">
        <label className="block mb-1 text-xs text-[#4a5568]">
          {(filterLabels as any).status?.label ?? "Status"}
        </label>
        <select
          value={activeFilters.status ?? ""}
          onChange={(e) =>
            handleChange({
              status: e.target.value
                ? (e.target.value as TaskStatus)
                : undefined,
            })
          }
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
        >
          <option value="">{(filterLabels as any).status?.all ?? "All"}</option>
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.SEEN}>Seen</option>
          <option value={TaskStatus.PENDING_REVIEW}>Pending Review</option>
          <option value={TaskStatus.COMPLETED}>Completed</option>
        </select>

        {departmentList.length > 0 && (
          <>
            <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
              {role === "supervisor" ? "Department" : "Sub-Department"}
            </label>
            <select
              value={activeFilters.departmentId ?? ""}
              onChange={(e) =>
                handleChange({ departmentId: e.target.value || undefined })
              }
              className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
            >
              <option value="">All</option>
              {departmentList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}
