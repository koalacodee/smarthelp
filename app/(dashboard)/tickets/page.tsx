"use client";
import { useEffect, useState } from "react";
import ReplyToTicketModal from "./components/ReplyToTicketModal";
import api, { TicketStatus, TicketMetrics } from "@/lib/api";
import { useTicketStore } from "./store/useTicketStore";
import TicketsDashboard from "./components/TicketsDashboard";
import TicketsFilters from "./components/TicketsFilters";
import TicketsList from "./components/TicketsList";

export default function Page() {
  const { tickets, setTickets } = useTicketStore();
  const [metrics, setMetrics] = useState<TicketMetrics>({
    totalTickets: 0,
    pendingTickets: 0,
    answeredTickets: 0,
    closedTickets: 0,
  });

  useEffect(() => {
    api.TicketsService.getAllTickets().then((val) => {
      setTickets(val.tickets);

      // Calculate metrics
      const totalTickets = val.tickets.length;
      const pendingTickets = val.tickets.filter(
        (ticket) =>
          ticket.status === TicketStatus.NEW ||
          ticket.status === TicketStatus.SEEN
      ).length;
      const answeredTickets = val.tickets.filter(
        (ticket) => ticket.status === TicketStatus.ANSWERED
      ).length;
      const closedTickets = val.tickets.filter(
        (ticket) => ticket.status === TicketStatus.CLOSED
      ).length;

      setMetrics({
        totalTickets,
        pendingTickets,
        answeredTickets,
        closedTickets,
      });
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-5 max-w-[1400px] mx-auto">
      <TicketsDashboard {...metrics} />
      <div className="space-y-5">
        <TicketsList tickets={tickets} />
        <TicketsFilters />
      </div>
      <ReplyToTicketModal />
    </div>
  );
}
