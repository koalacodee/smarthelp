import { SupportTicket, TicketStatus, CursorMeta } from "@/lib/api";
// import { SupportTicket } from "@/lib/api/types";
import { create } from "zustand";

interface TicketFilters {
  search: string;
  status: string;
  category: string;
}

interface TicketStore {
  tickets: SupportTicket[];
  filteredTickets: SupportTicket[];
  filters: TicketFilters;
  hoveredTicket: SupportTicket | null;
  loading: boolean;
  error: string | null;
  meta: CursorMeta | null;

  setTickets: (tickets: SupportTicket[], meta?: CursorMeta) => void;
  addTicket: (ticket: SupportTicket) => void;
  updateTicket: (id: string, updated: Partial<SupportTicket>) => void;
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
  meta: null,

  setTickets: (tickets, meta) => {
    set({ tickets, filteredTickets: tickets, meta: meta || null });
  },
  addTicket: (ticket) =>
    set((state) => {
      const newTickets = [...state.tickets, ticket];
      const newFilteredTickets = [...state.filteredTickets, ticket];
      return {
        tickets: newTickets,
        filteredTickets: newFilteredTickets,
      };
    }),
  updateTicket: (id, updated) =>
    set((state) => {
      const updatedTickets = state.tickets.map((t) =>
        t.id === id
          ? { ...t, ...updated, updatedAt: new Date().toISOString() }
          : t
      );
      const updatedFilteredTickets = state.filteredTickets.map((t) =>
        t.id === id
          ? { ...t, ...updated, updatedAt: new Date().toISOString() }
          : t
      );
      return {
        tickets: updatedTickets,
        filteredTickets: updatedFilteredTickets,
      };
    }),
  removeTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== id),
      filteredTickets: state.filteredTickets.filter((t) => t.id !== id),
    })),
  updateStatus: (id, status) =>
    set((state) => {
      const updatedTickets = state.tickets.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      );
      const updatedFilteredTickets = state.filteredTickets.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      );
      return {
        tickets: updatedTickets,
        filteredTickets: updatedFilteredTickets,
      };
    }),
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
          ticket.subject
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          ticket.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          ticket.guestEmail
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          ticket.guestName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          ticket.guestPhone
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((ticket) => ticket.status === filters.status);
    }

    // Category filter (using department name as category)
    if (filters.category) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.department?.name?.toLowerCase() ===
          filters.category.toLowerCase()
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
