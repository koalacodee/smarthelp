import { Metadata } from "next";
import { TicketsService, TicketMetrics, DepartmentsService } from "@/lib/api";
import TicketsPageClient from "./components/TicketsPageClient";

export const metadata: Metadata = {
  title: "Tickets | Support Management",
  description:
    "Manage support tickets, track responses, and monitor customer satisfaction",
};

export default async function Page() {
  const [response, departments] = await Promise.all([
    TicketsService.getAllTickets(),
    DepartmentsService.getAllDepartments(),
  ]);

  // Calculate metrics
  const totalTickets = response.metrics.totalTickets;
  const pendingTickets = response.metrics.pendingTickets;
  const answeredTickets = response.metrics.answeredTickets;
  const closedTickets = response.metrics.closedTickets;

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
      departments={departments}
    />
  );
}
