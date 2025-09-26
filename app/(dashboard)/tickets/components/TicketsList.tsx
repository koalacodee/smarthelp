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
      <div className="space-y-0">
        {tickets && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTicketClick(ticket)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm mb-1">
                    {ticket.subject}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
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
                        {ticket.interaction.type === "SATISFACTION"
                          ? "👍"
                          : "👎"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <TicketActions ticket={ticket} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No tickets found
          </div>
        )}
      </div>

      <TicketModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
