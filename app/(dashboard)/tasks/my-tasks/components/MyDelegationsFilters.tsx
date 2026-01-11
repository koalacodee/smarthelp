"use client";

import { motion } from "framer-motion";
import { useMyDelegationsStore } from "../store/useMyDelegationsStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface MyDelegationsFiltersProps {
  onFilterChange?: (filters: {
    search: string;
    status: string;
    priority: string;
  }) => void;
}

export default function MyDelegationsFilters({
  onFilterChange,
}: MyDelegationsFiltersProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { filters, setFilters } = useMyDelegationsStore();

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (!locale) return null;

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-base font-semibold mb-4 text-[#4a5568]"
      >
        {locale.tasks.delegations.filters.title}
      </motion.h3>
      <motion.input
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileFocus={{
          scale: 1.02,
          boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
        }}
        type="text"
        value={filters.search}
        onChange={(e) => handleFilterChange("search", e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#9333ea] transition-all duration-200"
        placeholder={locale.tasks.delegations.filters.searchPlaceholder}
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
          {locale.tasks.delegations.filters.status.label}
        </motion.label>
        <motion.select
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileFocus={{
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
          }}
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#9333ea] transition-all duration-200"
        >
          <option>{locale.tasks.delegations.filters.status.all}</option>
          <option>{locale.tasks.delegations.filters.status.completed}</option>
          <option>{locale.tasks.delegations.filters.status.inProgress}</option>
          <option>{locale.tasks.delegations.filters.status.pendingReview}</option>
        </motion.select>

        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="block mb-1 mt-4 text-xs text-[#4a5568]"
        >
          {locale.tasks.delegations.filters.priority.label}
        </motion.label>
        <motion.select
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          whileFocus={{
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
          }}
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#9333ea] transition-all duration-200"
        >
          <option>{locale.tasks.delegations.filters.priority.all}</option>
          <option>{locale.tasks.delegations.filters.priority.high}</option>
          <option>{locale.tasks.delegations.filters.priority.medium}</option>
          <option>{locale.tasks.delegations.filters.priority.low}</option>
        </motion.select>
      </motion.div>
    </div>
  );
}

