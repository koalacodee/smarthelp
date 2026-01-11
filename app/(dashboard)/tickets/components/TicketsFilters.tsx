"use client";

import { motion } from "framer-motion";
import { TicketStatus } from "@/lib/api";
import { Department } from "@/lib/api/departments";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface TicketsFiltersProps {
  search: string;
  status: string;
  department: string;
  departments: Department[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  isLoading?: boolean;
}

export default function TicketsFilters({
  search,
  status,
  department,
  departments,
  onSearchChange,
  onStatusChange,
  onDepartmentChange,
  isLoading = false,
}: TicketsFiltersProps) {
  const { locale } = useLocaleStore();

  const handleInputChange = (
    handler: (value: string) => void,
    value: string
  ) => {
    handler(value);
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
        {locale.tickets.filters.title}
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
        onChange={(e) => handleInputChange(onSearchChange, e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6] transition-all duration-200 disabled:opacity-60"
        placeholder={locale.tickets.filters.searchPlaceholder}
        disabled={isLoading}
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
          {locale.tickets.filters.statusLabel}
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
          onChange={(e) => handleInputChange(onStatusChange, e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
          disabled={isLoading}
        >
          <option value="">{locale.tickets.filters.allStatus}</option>
          <option value={TicketStatus.NEW}>{locale.tickets.filters.new}</option>
          <option value={TicketStatus.SEEN}>{locale.tickets.filters.seen}</option>
          <option value={TicketStatus.ANSWERED}>
            {locale.tickets.filters.answered}
          </option>
          <option value={TicketStatus.CLOSED}>
            {locale.tickets.filters.closed}
          </option>
        </motion.select>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mt-5"
      >
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="block mb-1 text-xs text-[#4a5568]"
        >
          {locale.tickets.filters.departmentLabel}
        </motion.label>
        <motion.select
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.55 }}
          whileFocus={{
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
          }}
          value={department}
          onChange={(e) =>
            handleInputChange(onDepartmentChange, e.target.value)
          }
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
          disabled={isLoading}
        >
          <option value="">
            {locale.tickets.filters.allDepartments}
          </option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </motion.select>
      </motion.div>
      {isLoading && (
        <p className="mt-4 text-xs text-slate-500 italic">
          {locale.tickets.filters.updating}
        </p>
      )}
    </div>
  );
}
