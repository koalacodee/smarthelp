import { Ticket, TicketStatus } from "@/lib/api";
import { create } from "zustand";

interface TicketStore {
  tickets: Ticket[];
  hoveredTicket: Ticket | null;
  loading: boolean;
  error: string | null;

  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updated: Partial<Ticket>) => void;
  removeTicket: (id: string) => void;
  updateStatus: (id: string, status: TicketStatus) => void;
  setHoveredTicket: (id: string | null) => void;
}

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  loading: false,
  error: null,
  hoveredTicket: null,

  setTickets: (tickets) => set({ tickets }),
  addTicket: (ticket) =>
    set((state) => ({ tickets: [...state.tickets, ticket] })),
  updateTicket: (id, updated) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id
          ? { ...t, ...updated, updatedAt: new Date().toISOString() }
          : t
      ),
    })),
  removeTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== id),
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      ),
    })),
  setHoveredTicket: (id) =>
    set((state) => ({
      hoveredTicket: id ? state.tickets.find((t) => t.id == id) : null,
    })),
}));
