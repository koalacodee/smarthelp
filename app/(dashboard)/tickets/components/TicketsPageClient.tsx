"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReplyToTicketModal from "./ReplyToTicketModal";
import { Ticket, TicketMetrics } from "@/lib/api";
import { useTicketStore } from "../store/useTicketStore";
import TicketsDashboard from "./TicketsDashboard";
import TicketsFilters from "./TicketsFilters";
import TicketsList from "./TicketsList";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";

interface TicketsPageClientProps {
  initialTickets: Ticket[];
  initialAttachments: { [ticketId: string]: string[] };
  initialMetrics: TicketMetrics;
}

export default function TicketsPageClient({
  initialTickets,
  initialAttachments,
  initialMetrics,
}: TicketsPageClientProps) {
  const { filteredTickets, setTickets } = useTicketStore();
  const { setAttachments } = useAttachmentsStore();
  const [metrics, setMetrics] = useState<TicketMetrics>(initialMetrics);

  // Initialize with server data
  useEffect(() => {
    setTickets(initialTickets);
    setAttachments("ticket", initialAttachments);
  }, [initialTickets, initialAttachments, setTickets, setAttachments]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </motion.div>
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="text-lg font-semibold text-slate-800"
                >
                  Support Tickets
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-sm text-slate-600"
                >
                  {filteredTickets.length} ticket
                  {filteredTickets.length !== 1 ? "s" : ""} available
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8"
        >
          {/* Left Column - Dashboard and Filters */}
          <div className="space-y-6">
            {/* Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <TicketsDashboard {...metrics} />
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <TicketsFilters />
            </motion.div>
          </div>

          {/* Right Column - Tickets List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{
              y: -2,
              transition: { duration: 0.2 },
            }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            <TicketsList tickets={filteredTickets} />
          </motion.div>
        </motion.div>

        <ReplyToTicketModal />
      </div>
    </motion.div>
  );
}
