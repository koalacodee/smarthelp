"use client";

import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useTaskStore } from "@/services/tasks/store";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { TaskStatus, TaskPriority } from "@/services/tasks/types";

export default function MyDelegationsFilters() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeFilters, setFilters } = useTaskStore();
  const { resetCursor } = useV2TaskPageStore();

  if (!locale) return null;

  const handleChange = (patch: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  }) => {
    setFilters(patch);
    if ("status" in patch) resetCursor();
  };

  const inputFocusClass =
    "focus:outline-none focus:border-[#9333ea] transition-all duration-200";

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-base font-semibold mb-4 text-[#4a5568]"
      >
        {locale.tasks.delegations?.filters?.title ?? "Filters"}
      </motion.h3>
      <motion.input
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        type="text"
        value={activeFilters.search ?? ""}
        onChange={(e) => handleChange({ search: e.target.value })}
        className={`w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm placeholder:text-[#9ca3af] ${inputFocusClass}`}
        placeholder={
          locale.tasks.delegations?.filters?.searchPlaceholder ??
          "Search delegations..."
        }
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-5"
      >
        <label className="block mb-1 text-xs text-[#4a5568]">
          {locale.tasks.delegations?.filters?.status?.label ??
            locale.tasks.myTasks?.filters?.status?.label ??
            "Status"}
        </label>
        <select
          value={activeFilters.status ?? ""}
          onChange={(e) =>
            handleChange({
              status: e.target.value ? (e.target.value as TaskStatus) : undefined,
            })
          }
          className={`w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] ${inputFocusClass}`}
        >
          <option value="">
            {locale.tasks.delegations?.filters?.status?.all ??
              locale.tasks.myTasks?.filters?.status?.all ??
              "All"}
          </option>
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.SEEN}>Seen</option>
          <option value={TaskStatus.PENDING_REVIEW}>Pending Review</option>
          <option value={TaskStatus.COMPLETED}>Completed</option>
        </select>

        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          {locale.tasks.delegations?.filters?.priority?.label ?? "Priority"}
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
          className={`w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] ${inputFocusClass}`}
        >
          <option value="">
            {locale.tasks.delegations?.filters?.priority?.all ?? "All"}
          </option>
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.LOW}>Low</option>
        </select>
      </motion.div>
    </div>
  );
}
