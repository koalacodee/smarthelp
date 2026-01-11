"use client";

import { motion } from "framer-motion";
import { TaskStatus } from "@/lib/api/tasks";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface Department {
  id: string;
  name: string;
}

interface TeamTasksFiltersProps {
  search: string;
  status: string;
  priority: string;
  department: string;
  departments: Department[];
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
}

export default function TeamTasksFilters({
  search,
  status,
  priority,
  department,
  departments,
  isLoading = false,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onDepartmentChange,
}: TeamTasksFiltersProps) {
  const locale = useLocaleStore((state) => state.locale);

  if (!locale) return null;

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-base font-semibold mb-4 text-[#4a5568]"
      >
        {locale.tasks.teamTasks.filters.title}
      </motion.h3>
      <motion.input
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileFocus={{
          scale: 1.02,
          boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        }}
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={isLoading}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={locale.tasks.teamTasks.filters.searchPlaceholder}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-5"
      >
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="block mb-1 text-xs text-[#4a5568]"
        >
          {locale.tasks.teamTasks.filters.status.label}
        </motion.label>
        <motion.select
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileFocus={{
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
          }}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{locale.tasks.teamTasks.filters.status.all}</option>
          <option value={TaskStatus.TODO}>{locale.tasks.teamTasks.filters.status.todo}</option>
          <option value={TaskStatus.SEEN}>{locale.tasks.teamTasks.filters.status.seen}</option>
          <option value={TaskStatus.PENDING_REVIEW}>{locale.tasks.teamTasks.filters.status.pendingReview}</option>
          <option value={TaskStatus.COMPLETED}>{locale.tasks.teamTasks.filters.status.completed}</option>
        </motion.select>

        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="block mb-1 mt-4 text-xs text-[#4a5568]"
        >
          {locale.tasks.teamTasks.filters.priority.label}
        </motion.label>
        <motion.select
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          whileFocus={{
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
          }}
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{locale.tasks.teamTasks.filters.priority.all}</option>
          <option value="HIGH">{locale.tasks.teamTasks.filters.priority.high}</option>
          <option value="MEDIUM">{locale.tasks.teamTasks.filters.priority.medium}</option>
          <option value="LOW">{locale.tasks.teamTasks.filters.priority.low}</option>
        </motion.select>

        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="block mb-1 mt-4 text-xs text-[#4a5568]"
        >
          {locale.tasks.teamTasks.filters.department.label}
        </motion.label>
        <motion.select
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          whileFocus={{
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
          }}
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{locale.tasks.teamTasks.filters.department.all}</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </motion.select>
      </motion.div>
    </div>
  );
}
