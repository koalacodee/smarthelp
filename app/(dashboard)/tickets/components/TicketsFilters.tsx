"use client";

import { motion } from "framer-motion";
import { TicketStatus } from "@/lib/api";
import { useTicketStore } from "../store/useTicketStore";

export default function TicketsFilters() {
  const { filters, setFilters } = useTicketStore();

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-base font-semibold mb-4 text-[#4a5568]"
      >
        Filters &amp; Search
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
        value={filters.search}
        onChange={(e) => handleFilterChange("search", e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
        placeholder="Search tickets..."
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
          Status
        </motion.label>
        <motion.select
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileFocus={{
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
          }}
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6] transition-all duration-200"
        >
          <option value="">All</option>
          <option value={TicketStatus.NEW}>New</option>
          <option value={TicketStatus.SEEN}>Seen</option>
          <option value={TicketStatus.ANSWERED}>Answered</option>
          <option value={TicketStatus.CLOSED}>Closed</option>
        </motion.select>
      </motion.div>
    </div>
  );
}
