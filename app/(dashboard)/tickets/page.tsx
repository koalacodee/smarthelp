"use client";
import { useEffect } from "react";
import ReplyToTicketModal from "./components/ReplyToTicketModal";
import api, { TicketStatus } from "@/lib/api";
import { useTicketStore } from "./store/useTicketStore";
import TicketDetails from "./components/TicketDetails";
import TicketActions from "./components/TicketActions";

export default function Page() {
  const { tickets, setTickets, hoveredTicket, setHoveredTicket } =
    useTicketStore();
  useEffect(() => {
    api.TicketsService.getAllTickets().then((val) => {
      setTickets(val);
    });
  }, []);

  const getTicketStatusBadgeColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.NEW:
        return "bg-blue-100 text-blue-800";
      case TicketStatus.SEEN:
        return "bg-amber-100 text-amber-800";
      case TicketStatus.ANSWERED:
        return "bg-green-100 text-green-800";
      case TicketStatus.CLOSED:
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMouseEnter = (ticketId: string) => {
    setHoveredTicket(ticketId);
  };

  const handleMouseLeave = () => {
    setHoveredTicket(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <label htmlFor="ticket-search" className="sr-only">
          Search Tickets by ID, Subject, Name or Phone
        </label>
        <div className="relative w-full md:w-2/5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <input
            id="ticket-search"
            placeholder="Search by ID, Subject, Name or Phone..."
            className="block w-full rounded-md border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            type="search"
            defaultValue=""
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Subject
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Sub-department
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Assigned To
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Rating
              </th>
              <th
                scope="col"
                className="relative px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-slate-50 transition-colors"
                onMouseEnter={() => handleMouseEnter(ticket.id)}
                onMouseLeave={handleMouseLeave}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 capitalize inline-flex text-xs leading-5 font-semibold rounded-full ${getTicketStatusBadgeColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-4 py-4 max-w-sm">
                  <p
                    className="text-sm text-slate-900 truncate"
                    title="fdgdfgdfg"
                  >
                    {ticket.subject}
                  </p>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                  N/A
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 w-48">
                  <select
                    className="w-full text-sm border-slate-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    title="Ticket must have a sub-department to be assigned"
                  >
                    <option value="">
                      {ticket.assignee?.user?.name || "No eligible staff"}
                    </option>
                  </select>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                  {ticket.guest.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className="text-slate-400 italic text-xs">
                    {ticket.interaction
                      ? ticket.interaction.type === "SATISFACTION"
                        ? "👍"
                        : "👎"
                      : "N/A"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <TicketActions ticket={ticket} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hoveredTicket && <TicketDetails ticket={hoveredTicket} />}
      <ReplyToTicketModal />
    </div>
  );
}
