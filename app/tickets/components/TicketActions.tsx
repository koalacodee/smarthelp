import { useUserStore } from "@/app/store/useUserStore";
import { useCurrentEditingTicketStore } from "../store/useCurrentReplyingTicket";
import api, { Ticket, TicketStatus } from "@/lib/api";
import { useTicketStore } from "../store/useTicketStore";

export default function TicketActions({ ticket }: { ticket: Ticket }) {
  const { user } = useUserStore();

  const isManager = user?.role == "ADMIN" || user?.role == "SUPERVISOR";
  const isAllowedEmployee =
    user?.role == "EMPLOYEE" && user.permissions.includes("CLOSE_TICKETS");

  const { setTicket } = useCurrentEditingTicketStore();
  const { setHoveredTicket, updateStatus } = useTicketStore();

  const handleReopenTicket = async (id: string) => {
    await api.TicketsService.reopenTicket(id);
    updateStatus(id, TicketStatus.SEEN);
  };

  const handleCloseTicket = async (id: string) => {
    await api.TicketsService.closeTicket(id);
    updateStatus(id, TicketStatus.CLOSED);
  };
  return (
    <div className="flex justify-end items-center gap-4">
      {(() => {
        if (ticket.status === TicketStatus.CLOSED) {
          return (
            <span
              className="text-xs font-semibold italic text-slate-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setHoveredTicket(ticket.id);
              }}
            >
              Closed
            </span>
          );
        }

        if (ticket.status === TicketStatus.ANSWERED) {
          return (
            <>
              {isManager && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReopenTicket(ticket.id);
                  }}
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  Re-open for Reply
                </button>
              )}
              {(isManager || isAllowedEmployee) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTicket(ticket.id);
                  }}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Close
                </button>
              )}
              {!isManager && !isAllowedEmployee && (
                <span className="text-xs font-semibold italic text-green-600">
                  Answered
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTicket(ticket);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details
              </button>
            </>
          );
        }

        // Status is New or Seen
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTicket(ticket);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {ticket.answer ? "View / Edit Reply" : "Reply"}
          </button>
        );
      })()}
    </div>
  );
}
