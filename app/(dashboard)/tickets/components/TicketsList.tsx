"use client";
import { Ticket, TicketStatus } from "@/lib/api";
import TicketActions from "./TicketActions";
import TicketModal from "./TicketModal";
import { useState } from "react";

const getTicketStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.NEW:
      return (
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          New
        </span>
      );
    case TicketStatus.SEEN:
      return (
        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
          Seen
        </span>
      );
    case TicketStatus.ANSWERED:
      return (
        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
          Answered
        </span>
      );
    case TicketStatus.CLOSED:
      return (
        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
          Closed
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
          Unknown
        </span>
      );
  }
};

const getPriorityBadge = (priority?: string) => {
  if (!priority) return null;

  switch (priority.toUpperCase()) {
    case "HIGH":
      return (
        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
          High
        </span>
      );
    case "MEDIUM":
      return (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
          Medium
        </span>
      );
    case "LOW":
      return (
        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
          Low
        </span>
      );
    default:
      return null;
  }
};

interface TicketsListProps {
  tickets: Ticket[];
}

export default function TicketsList({ tickets }: TicketsListProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
        <ul className="list-none">
          {tickets.map((ticket) => (
            <li
              onClick={() => handleTicketClick(ticket)}
              key={ticket.id}
              className="py-4 border-b border-dashed border-[#e2e8f0] flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">{ticket.subject}</div>
                <div className="text-xs text-[#667eea] mb-2">
                  {ticket.guestName} •{" "}
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {getTicketStatusBadge(ticket.status)}
                  {ticket.department?.name && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {ticket.department.name}
                    </span>
                  )}
                  {ticket.interaction && (
                    <span className="text-slate-400 italic">
                      {ticket.interaction.type === "SATISFACTION" ? "👍" : "👎"}
                    </span>
                  )}
                </div>
              </div>
              <TicketActions ticket={ticket} />
            </li>
          ))}
        </ul>
      </div>

      <TicketModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
