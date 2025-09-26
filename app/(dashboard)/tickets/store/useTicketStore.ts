import { Ticket, TicketStatus } from "@/lib/api";
import { create } from "zustand";

interface TicketFilters {
  search: string;
  status: string;
  category: string;
}

interface TicketStore {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  filters: TicketFilters;
  hoveredTicket: Ticket | null;
  loading: boolean;
  error: string | null;

  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updated: Partial<Ticket>) => void;
  removeTicket: (id: string) => void;
  updateStatus: (id: string, status: TicketStatus) => void;
  setHoveredTicket: (id: string | null) => void;

  // Filter actions
  setFilters: (filters: Partial<TicketFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  filteredTickets: [],
  filters: {
    search: "",
    status: "",
    category: "",
  },
  loading: false,
  error: null,
  hoveredTicket: null,

  setTickets: (tickets) => {
    set({ tickets, filteredTickets: tickets });
  },
  addTicket: (ticket) =>
    set((state) => {
      const newTickets = [...state.tickets, ticket];
      return { tickets: newTickets };
    }),
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

  // Filter actions
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { tickets, filters } = get();
    let filtered = [...tickets];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          ticket.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          ticket.userEmail?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((ticket) => ticket.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (ticket) => ticket.category === filters.category
      );
    }

    set({ filteredTickets: filtered });
  },

  clearFilters: () => {
    set({
      filters: {
        search: "",
        status: "",
        category: "",
      },
    });
    get().applyFilters();
  },
}));
