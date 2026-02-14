"use client";

import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useTaskStore } from "@/services/tasks/store";
import { useV2TaskPageStore } from "../_store/use-v2-task-page-store";
import { TaskStatus, TaskPriority } from "@/services/tasks/types";

export default function TaskFilters() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeFilters, setFilters } = useTaskStore();
  const { role, departments, subDepartments, resetCursor } =
    useV2TaskPageStore();

  if (!locale) return null;

  const departmentList = role === "supervisor" ? subDepartments : departments;

  const handleChange = (patch: Parameters<typeof setFilters>[0]) => {
    setFilters(patch);
    resetCursor();
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">
        {locale.tasks.teamTasks.filters.title}
      </h3>
      <input
        type="text"
        value={activeFilters.search ?? ""}
        onChange={(e) => handleChange({ search: e.target.value })}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
        placeholder={locale.tasks.teamTasks.filters.searchPlaceholder}
      />
      <div className="mt-5">
        <label className="block mb-1 text-xs text-[#4a5568]">
          {locale.tasks.teamTasks.filters.status.label}
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
          <option value="">{locale.tasks.teamTasks.filters.status.all}</option>
          <option value={TaskStatus.TODO}>
            {locale.tasks.teamTasks.filters.status.todo}
          </option>
          <option value={TaskStatus.SEEN}>
            {locale.tasks.teamTasks.filters.status.seen}
          </option>
          <option value={TaskStatus.PENDING_REVIEW}>
            {locale.tasks.teamTasks.filters.status.pendingReview}
          </option>
          <option value={TaskStatus.COMPLETED}>
            {locale.tasks.teamTasks.filters.status.completed}
          </option>
        </select>

        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          {locale.tasks.teamTasks.filters.priority.label}
        </label>
        <select
          value={activeFilters.priority ?? ""}
          onChange={(e) =>
            handleChange({
              priority: e.target.value
                ? (e.target.value as TaskPriority)
                : undefined,
            })
          }
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
        >
          <option value="">
            {locale.tasks.teamTasks.filters.priority.all}
          </option>
          <option value="HIGH">
            {locale.tasks.teamTasks.filters.priority.high}
          </option>
          <option value="MEDIUM">
            {locale.tasks.teamTasks.filters.priority.medium}
          </option>
          <option value="LOW">
            {locale.tasks.teamTasks.filters.priority.low}
          </option>
        </select>

        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          {locale.tasks.teamTasks.filters.department.label}
        </label>
        <select
          value={activeFilters.departmentId ?? ""}
          onChange={(e) =>
            handleChange({ departmentId: e.target.value || undefined })
          }
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
        >
          <option value="">
            {locale.tasks.teamTasks.filters.department.all}
          </option>
          {departmentList.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
