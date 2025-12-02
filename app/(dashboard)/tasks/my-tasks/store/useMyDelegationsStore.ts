import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TaskDelegationDTO } from "@/lib/api/v2/services/delegations";

interface DelegationFilters {
  search: string;
  status: string;
  priority: string;
}

interface MyDelegationsStore {
  // Data
  delegations: TaskDelegationDTO[];
  filteredDelegations: TaskDelegationDTO[];
  filters: DelegationFilters;
  total: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setDelegations: (delegations: TaskDelegationDTO[], total: number) => void;
  updateDelegation: (delegationId: string, updates: Partial<TaskDelegationDTO>) => void;

  // Filter actions
  setFilters: (filters: Partial<DelegationFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Utility actions
  getDelegationById: (id: string) => TaskDelegationDTO | undefined;
}

export const useMyDelegationsStore = create<MyDelegationsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      delegations: [],
      filteredDelegations: [],
      filters: {
        search: "",
        status: "All",
        priority: "All",
      },
      total: 0,
      isLoading: false,
      error: null,

      // Data actions
      setDelegations: (delegations, total) => {
        set({ delegations, filteredDelegations: delegations, total });
        get().applyFilters();
      },

      updateDelegation: (delegationId, updates) => {
        set((state) => ({
          delegations: state.delegations.map((delegation) =>
            delegation.id === delegationId
              ? { ...delegation, ...updates }
              : delegation
          ),
        }));
        get().applyFilters();
      },

      // Filter actions
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
        get().applyFilters();
      },

      applyFilters: () => {
        const { delegations, filters } = get();
        let filtered = [...delegations];

        // Search filter
        if (filters.search) {
          filtered = filtered.filter(
            (delegation) =>
              delegation.task?.title
                ?.toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              delegation.task?.description
                ?.toLowerCase()
                .includes(filters.search.toLowerCase())
          );
        }

        // Status filter
        if (filters.status !== "All") {
          const statusMap: { [key: string]: string } = {
            Completed: "COMPLETED",
            "In Progress": "TODO",
            "Pending Review": "PENDING_REVIEW",
          };
          filtered = filtered.filter(
            (delegation) => delegation.status === statusMap[filters.status]
          );
        }

        // Priority filter
        if (filters.priority !== "All") {
          filtered = filtered.filter(
            (delegation) =>
              delegation.task?.priority === filters.priority.toUpperCase()
          );
        }

        set({ filteredDelegations: filtered });
      },

      clearFilters: () => {
        set({
          filters: {
            search: "",
            status: "All",
            priority: "All",
          },
        });
        get().applyFilters();
      },

      // Loading actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Utility actions
      getDelegationById: (id) => {
        return get().delegations.find((delegation) => delegation.id === id);
      },
    }),
    {
      name: "my-delegations-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

