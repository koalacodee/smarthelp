import { createEntityStore } from "./useEntityStore";
import { Ticket } from "@/lib/api";

// Extended ticket store with ticket-specific functionality
interface TicketStoreState {
  // Inherit all base entity functionality
  entities: Ticket[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Base entity actions
  setEntities: (entities: Ticket[]) => void;
  addEntity: (entity: Ticket) => void;
  addEntities: (entities: Ticket[]) => void;
  updateEntity: (id: string, updates: Partial<Ticket>) => void;
  deleteEntity: (id: string) => void;
  clearEntities: () => void;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setError: (error: string | null) => void;
  getEntityById: (id: string) => Ticket | undefined;
  getEntitiesByField: <K extends keyof Ticket>(
    field: K,
    value: Ticket[K]
  ) => Ticket[];

  // Ticket-specific state
  hoveredTicket: Ticket | null;
  selectedTickets: string[];

  // Ticket-specific actions
  setHoveredTicket: (ticket: Ticket | null) => void;
  setSelectedTickets: (ticketIds: string[]) => void;
  toggleTicketSelection: (ticketId: string) => void;
  clearSelection: () => void;

  // Ticket-specific queries
  getTicketsByStatus: (status: string) => Ticket[];
  getTicketsByDepartment: (departmentId: string) => Ticket[];
  getTicketsByAssignee: (assigneeId: string) => Ticket[];
}

export const useTicketStore = createEntityStore<Ticket>("ticket-store", {
  persist: true,
  partialize: (state) => ({
    entities: state.entities,
    // Don't persist UI state like hoveredTicket or selectedTickets
  }),
}) as any;

// Extend the store with ticket-specific functionality
const ticketStore = useTicketStore.getState();

// Add ticket-specific state and actions
Object.assign(ticketStore, {
  hoveredTicket: null,
  selectedTickets: [],

  setHoveredTicket: (ticket: Ticket | null) =>
    useTicketStore.setState({ hoveredTicket: ticket }),

  setSelectedTickets: (ticketIds: string[]) =>
    useTicketStore.setState({ selectedTickets: ticketIds }),

  toggleTicketSelection: (ticketId: string) => {
    const state = useTicketStore.getState();
    const isSelected = state.selectedTickets.includes(ticketId);
    const newSelection = isSelected
      ? state.selectedTickets.filter((id: string) => id !== ticketId)
      : [...state.selectedTickets, ticketId];
    useTicketStore.setState({ selectedTickets: newSelection });
  },

  clearSelection: () => useTicketStore.setState({ selectedTickets: [] }),

  getTicketsByStatus: (status: string) => {
    const state = useTicketStore.getState();
    return state.entities.filter((ticket: Ticket) => ticket.status === status);
  },

  getTicketsByDepartment: (departmentId: string) => {
    const state = useTicketStore.getState();
    return state.entities.filter(
      (ticket: Ticket) => ticket.departmentId === departmentId
    );
  },

  getTicketsByAssignee: (assigneeId: string) => {
    const state = useTicketStore.getState();
    return state.entities.filter(
      (ticket: Ticket) => ticket.assignee?.userId === assigneeId
    );
  },
});
