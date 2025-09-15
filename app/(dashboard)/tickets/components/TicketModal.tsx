"use client";
import { Ticket, TicketStatus } from "@/lib/api";
import X from "@/icons/X";
import ThumbDown from "@/icons/ThumbDown";
import ThumbUp from "@/icons/ThumbUp";
import TicketActions from "./TicketActions";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";

interface TicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

const getTicketStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.NEW:
      return (
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          New
        </span>
      );
    case TicketStatus.SEEN:
      return (
        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
          Seen
        </span>
      );
    case TicketStatus.ANSWERED:
      return (
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Answered
        </span>
      );
    case TicketStatus.CLOSED:
      return (
        <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-medium">
          Closed
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          Unknown
        </span>
      );
  }
};

export default function TicketModal({
  ticket,
  isOpen,
  onClose,
}: TicketModalProps) {
  if (!ticket) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <DialogTitle
                      as="h2"
                      className="text-xl font-semibold text-gray-900"
                    >
                      {ticket.subject}
                    </DialogTitle>
                    {getTicketStatusBadge(ticket.status)}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          User
                        </label>
                        <p className="text-gray-900">{ticket.guestName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Phone
                        </label>
                        <p className="text-gray-900">{ticket.guestPhone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Department
                        </label>
                        <p className="text-gray-900">
                          {ticket.department?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Created Date
                        </label>
                        <p className="text-gray-900">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {ticket.description}
                        </p>
                      </div>
                    </div>

                    {/* Admin Reply */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Admin Reply
                      </label>
                      <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                        {ticket.answer ? (
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {ticket.answer}
                          </p>
                        ) : (
                          <p className="text-gray-500 italic">No reply yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Customer Rating */}
                    {ticket?.interaction && ticket?.interaction?.type && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Customer Rating
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                              ticket?.interaction?.type === "SATISFACTION"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ticket?.interaction?.type === "SATISFACTION" ? (
                              <ThumbUp className="w-4 h-4" />
                            ) : (
                              <ThumbDown className="w-4 h-4" />
                            )}
                            <span className="capitalize">
                              {ticket?.interaction?.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
