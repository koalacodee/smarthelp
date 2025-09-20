import { Metadata } from "next";
import { TicketsService, TicketStatus, TicketMetrics } from "@/lib/api";
import TicketsPageClient from "./components/TicketsPageClient";

export const metadata: Metadata = {
  title: "Tickets | Support Management",
  description:
    "Manage support tickets, track responses, and monitor customer satisfaction",
};

export default async function Page() {
  const response = await TicketsService.getAllTickets();

  // Calculate metrics
  const totalTickets = response.tickets.length;
  const pendingTickets = response.tickets.filter(
    (ticket) =>
      ticket.status === TicketStatus.NEW || ticket.status === TicketStatus.SEEN
  ).length;
  const answeredTickets = response.tickets.filter(
    (ticket) => ticket.status === TicketStatus.ANSWERED
  ).length;
  const closedTickets = response.tickets.filter(
    (ticket) => ticket.status === TicketStatus.CLOSED
  ).length;

  const metrics: TicketMetrics = {
    totalTickets,
    pendingTickets,
    answeredTickets,
    closedTickets,
  };

  return (
    <TicketsPageClient
      initialTickets={response.tickets}
      initialAttachments={response.attachments}
      initialMetrics={metrics}
    />
  );
}
