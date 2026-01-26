"use client";
import { SupportTicket, TicketStatus } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import TicketActionsDropdown from "./TicketActionsDropdown";
import { useCurrentEditingTicketStore } from "../store/useCurrentReplyingTicket";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

function getTicketStatusBadge(status: TicketStatus, locale: any) {
  if (!locale) return null;

  switch (status) {
    case TicketStatus.NEW:
      return (
        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
          {locale.tickets.filters.new}
        </span>
      );
    case TicketStatus.SEEN:
      return (
        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs">
          {locale.tickets.filters.seen}
        </span>
      );
    case TicketStatus.ANSWERED:
      return (
        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">
          {locale.tickets.filters.answered}
        </span>
      );
    case TicketStatus.CLOSED:
      return (
        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">
          {locale.tickets.filters.closed}
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs">
          {locale.tickets.list.unknown}
        </span>
      );
  }
}

interface TicketsListProps {
  tickets: SupportTicket[];
}

export default function TicketsList({ tickets }: TicketsListProps) {
  const { setTicket } = useCurrentEditingTicketStore();
  const { locale } = useLocaleStore();
  const language = useLocaleStore((state) => state.language);

  if (!locale) return null;

  const handleTicketClick = (ticket: SupportTicket) => {
    setTicket(ticket);
  };

  return (
    <>
      {/* Table Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 border-b border-slate-200"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-600 uppercase tracking-wider"
        >
          <div className="col-span-4">{locale.tickets.list.subject}</div>
          <div className="col-span-2">{locale.tickets.list.status}</div>
          <div className="col-span-2">{locale.tickets.list.department}</div>
          <div className="col-span-1">{locale.tickets.list.priority}</div>
          <div className="col-span-2">{locale.tickets.list.date}</div>
          <div className="col-span-1">{locale.tickets.list.actions}</div>
        </motion.div>
      </motion.div>

      {/* Table Body */}
      <div className="divide-y divide-slate-200">
        <AnimatePresence>
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                transition={{
                  duration: 0.3,
                  delay: 1 + index * 0.05,
                  ease: "easeOut",
                }}
                className="group hover:bg-slate-50 transition-all duration-200 cursor-pointer relative hover:z-10"
              >
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                  {/* Subject */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                    className="col-span-4 flex items-start gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 1.2 + index * 0.05 }}
                      className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium text-slate-900 truncate"
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {ticket.guestName}
                      </p>
                    </div>
                  </motion.div>

                  {/* Status */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                    className="col-span-2 flex items-center"
                  >
                    {getTicketStatusBadge(ticket.status, locale)}
                  </motion.div>

                  {/* Department */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                    className="col-span-2 flex items-center"
                  >
                    {ticket.department?.name ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {ticket.department.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </motion.div>

                  {/* Date */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                    className="col-span-2 flex items-center"
                  >
                    <span className="text-sm text-slate-600">
                      {formatDateWithHijri(ticket.createdAt, language)}
                    </span>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                    className="col-span-1 flex items-center justify-end"
                  >

                    <TicketActionsDropdown ticket={ticket} />

                  </motion.div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="px-6 py-16 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 }}
                className="flex flex-col items-center justify-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 1.2, ease: "backOut" }}
                  className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-8 h-8 text-slate-400"
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.3 }}
                  className="text-slate-500"
                >
                  <p className="text-lg font-medium mb-2">
                    {locale.tickets.list.noTickets}
                  </p>
                  <p className="text-sm">{locale.tickets.list.noTicketsHint}</p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
