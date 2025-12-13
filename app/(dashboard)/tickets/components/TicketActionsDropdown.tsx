"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentEditingTicketStore } from "../store/useCurrentReplyingTicket";
import api, { SupportTicket, TicketStatus, UserResponse } from "@/lib/api";
import { useTicketStore } from "../store/useTicketStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useToastStore } from "../../store/useToastStore";

interface TicketActionsDropdownProps {
  ticket: SupportTicket;
}

export default function TicketActionsDropdown({
  ticket,
}: TicketActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isManager = user?.role == "ADMIN" || user?.role == "SUPERVISOR";
  const isAdmin = user?.role == "ADMIN";
  const isAllowedEmployee =
    user?.role == "EMPLOYEE" && user.permissions.includes("CLOSE_TICKETS");

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { setTicket } = useCurrentEditingTicketStore();
  const { updateStatus, removeTicket } = useTicketStore();
  const { openModal } = useConfirmationModalStore();
  const { addToast } = useToastStore();

  const handleReopenTicket = async (id: string) => {
    await api.TicketsService.reopenTicket(id);
    updateStatus(id, TicketStatus.SEEN);
    setIsOpen(false);
  };

  const handleCloseTicket = async (id: string) => {
    await api.TicketsService.closeTicket(id);
    updateStatus(id, TicketStatus.CLOSED);
    setIsOpen(false);
  };

  const handleViewDetails = (ticket: SupportTicket) => {
    setTicket(ticket);
    setIsOpen(false);
  };

  const handleDeleteTicket = (id: string) => {
    openModal({
      title: "Delete Ticket",
      message:
        "Are you sure you want to delete this ticket? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        await api.TicketsService.deleteTicket(id);
        removeTicket(id);
        setIsOpen(false);
        addToast({
          message: "Ticket deleted successfully",
          type: "success",
        });
      },
    });
  };

  const getActions = () => {
    if (ticket.status === TicketStatus.CLOSED) {
      const actions = [
        {
          label: "View Details",
          onClick: () => handleViewDetails(ticket),
          className: "text-blue-600 hover:bg-blue-50",
        },
      ];

      if (isAdmin) {
        actions.push({
          label: "Delete",
          onClick: () => handleDeleteTicket(ticket.id),
          className: "text-red-600 hover:bg-red-50",
        });
      }

      return actions;
    }

    if (ticket.status === TicketStatus.ANSWERED) {
      const actions = [
        {
          label: "View Details",
          onClick: () => handleViewDetails(ticket),
          className: "text-blue-600 hover:bg-blue-50",
        },
      ];

      if (isManager) {
        actions.push({
          label: "Re-open for Reply",
          onClick: () => handleReopenTicket(ticket.id),
          className: "text-amber-600 hover:bg-amber-50",
        });
      }

      if (isManager || isAllowedEmployee) {
        actions.push({
          label: "Close",
          onClick: () => handleCloseTicket(ticket.id),
          className: "text-green-600 hover:bg-green-50",
        });
      }

      if (isAdmin) {
        actions.push({
          label: "Delete",
          onClick: () => handleDeleteTicket(ticket.id),
          className: "text-red-600 hover:bg-red-50",
        });
      }

      return actions;
    }

    // Status is New or Seen
    const actions = [
      {
        label: ticket.answer ? "View / Edit Reply" : "Reply",
        onClick: () => handleViewDetails(ticket),
        className: "text-blue-600 hover:bg-blue-50",
      },
    ];

    if (isAdmin) {
      actions.push({
        label: "Delete",
        onClick: () => handleDeleteTicket(ticket.id),
        className: "text-red-600 hover:bg-red-50",
      });
    }

    return actions;
  };

  const actions = getActions();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
      >
        <svg
          className="w-4 h-4 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`w-full text-left px-4 py-2 text-sm ${action.className} hover:bg-slate-50 transition-colors duration-200`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
