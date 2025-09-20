"use client";

import { useState, useEffect } from "react";
import ReplyToTicketModal from "./ReplyToTicketModal";
import { Ticket, TicketMetrics } from "@/lib/api";
import { useTicketStore } from "../store/useTicketStore";
import TicketsDashboard from "./TicketsDashboard";
import TicketsFilters from "./TicketsFilters";
import TicketsList from "./TicketsList";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";

interface TicketsPageClientProps {
  initialTickets: Ticket[];
  initialAttachments: { [ticketId: string]: string[] };
  initialMetrics: TicketMetrics;
}

export default function TicketsPageClient({
  initialTickets,
  initialAttachments,
  initialMetrics,
}: TicketsPageClientProps) {
  const { setTickets } = useTicketStore();
  const { setAttachments } = useAttachmentsStore();
  const [metrics, setMetrics] = useState<TicketMetrics>(initialMetrics);

  // Initialize with server data
  useEffect(() => {
    setTickets(initialTickets);
    setAttachments("ticket", initialAttachments);
  }, [initialTickets, initialAttachments, setTickets, setAttachments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-5 max-w-[1400px] mx-auto">
      <TicketsDashboard {...metrics} />
      <div className="space-y-5">
        <TicketsList tickets={initialTickets} />
        <TicketsFilters />
      </div>
      <ReplyToTicketModal />
    </div>
  );
}
