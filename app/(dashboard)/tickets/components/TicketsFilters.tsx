"use client";

import { TicketStatus } from "@/lib/api";
import { useTicketStore } from "../store/useTicketStore";

export default function TicketsFilters() {
  const { filters, setFilters } = useTicketStore();

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
        placeholder="Search tickets..."
      />
      <div className="mt-5">
        <label className="block mb-1 text-xs text-[#4a5568]">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]"
        >
          <option value="">All</option>
          <option value={TicketStatus.NEW}>New</option>
          <option value={TicketStatus.SEEN}>Seen</option>
          <option value={TicketStatus.ANSWERED}>Answered</option>
          <option value={TicketStatus.CLOSED}>Closed</option>
        </select>
      </div>
    </div>
  );
}
