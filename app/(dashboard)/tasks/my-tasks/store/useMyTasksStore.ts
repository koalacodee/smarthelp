import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MyTasksResponse } from "@/lib/api";

interface MyTasksFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
}

interface MyTasksStore {
  // Data
  tasks: MyTasksResponse["data"];
  filteredTasks: MyTasksResponse["data"];
  filters: MyTasksFilters;
  total: number;
  metrics: MyTasksResponse["metrics"];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setTasks: (data: MyTasksResponse) => void;
  updateTask: (
    taskId: string,
    updates: Partial<MyTasksResponse["data"][0]>
  ) => void;

  // Filter actions
  setFilters: (filters: Partial<MyTasksFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Utility actions
  getTaskById: (id: string) => MyTasksResponse["data"][0] | undefined;
  getTasksByStatus: (status: string) => MyTasksResponse["data"];
  getTasksByPriority: (priority: string) => MyTasksResponse["data"];
}

export const useMyTasksStore = create<MyTasksStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      filteredTasks: [],
      filters: {
        search: "",
        status: "All",
        priority: "All",
        category: "All",
      },
      total: 0,
      metrics: {
        completedCount: 0,
        pendingCount: 0,
        completionPercentage: 0,
      },
      isLoading: false,
      error: null,

      // Data actions
      setTasks: (data) => {
        set((state) => {
          const nextTasks = data.data;
          // Keep filters as-is; recompute filteredTasks accordingly
          const nextState = {
            tasks: nextTasks,
            total: data.total,
            metrics: data.metrics,
          } as Partial<MyTasksStore>;
          // Derive filteredTasks using current filters
          const { filters } = state;
          let filtered = [...nextTasks];
          if (filters.search) {
            filtered = filtered.filter(
              (task) =>
                task.title
                  ?.toLowerCase()
                  .includes(filters.search.toLowerCase()) ||
                task.description
                  ?.toLowerCase()
                  .includes(filters.search.toLowerCase())
            );
          }
          if (filters.status !== "All") {
            const statusMap: { [key: string]: string } = {
              Completed: "COMPLETED",
              "In Progress": "TODO",
              "Pending Review": "PENDING_REVIEW",
              Seen: "SEEN",
              Rejected: "REJECTED",
            };
            filtered = filtered.filter(
              (task) => task.status === statusMap[filters.status]
            );
          }
          if (filters.priority !== "All") {
            filtered = filtered.filter(
              (task) => task.priority === filters.priority.toUpperCase()
            );
          }
          // Category kept as placeholder
          nextState.filteredTasks = filtered;
          return nextState as MyTasksStore;
        });
      },

      updateTask: (taskId, updates) =>
        set((state) => {
          const nextTasks = state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          );
          // Re-derive filteredTasks with same filters
          const { filters } = state;
          let filtered = [...nextTasks];
          if (filters.search) {
            filtered = filtered.filter(
              (task) =>
                task.title
                  ?.toLowerCase()
                  .includes(filters.search.toLowerCase()) ||
                task.description
                  ?.toLowerCase()
                  .includes(filters.search.toLowerCase())
            );
          }
          if (filters.status !== "All") {
            const statusMap: { [key: string]: string } = {
              Completed: "COMPLETED",
              "In Progress": "TODO",
              "Pending Review": "PENDING_REVIEW",
              Seen: "SEEN",
              Rejected: "REJECTED",
            };
            filtered = filtered.filter(
              (task) => task.status === statusMap[filters.status]
            );
          }
          if (filters.priority !== "All") {
            filtered = filtered.filter(
              (task) => task.priority === filters.priority.toUpperCase()
            );
          }
          // Recompute metrics and total from nextTasks to keep dashboard in sync
          const total = nextTasks.length;
          const completedCount = nextTasks.filter(
            (t) => t.status === "COMPLETED"
          ).length;
          const pendingCount = total - completedCount;
          const completionPercentage =
            total === 0 ? 0 : Math.round((completedCount / total) * 100);
          return {
            tasks: nextTasks,
            filteredTasks: filtered,
            total,
            metrics: { completedCount, pendingCount, completionPercentage },
          } as Partial<MyTasksStore> as MyTasksStore;
        }),

      // Filter actions
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
        get().applyFilters();
      },

      applyFilters: () => {
        const { tasks, filters } = get();
        let filtered = [...tasks];

        // Search filter
        if (filters.search) {
          filtered = filtered.filter(
            (task) =>
              task.title
                ?.toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              task.description
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
            Seen: "SEEN",
            Rejected: "REJECTED",
          };
          filtered = filtered.filter(
            (task) => task.status === statusMap[filters.status]
          );
        }

        // Priority filter
        if (filters.priority !== "All") {
          filtered = filtered.filter(
            (task) => task.priority === filters.priority.toUpperCase()
          );
        }

        // Category filter (this is a custom filter for my-tasks)
        if (filters.category !== "All") {
          // You can implement category logic based on your requirements
          // For now, we'll use a simple example
          filtered = filtered.filter((task) => {
            // This is a placeholder - implement based on your category logic
            return true;
          });
        }

        set({ filteredTasks: filtered });
      },

      clearFilters: () => {
        set({
          filters: {
            search: "",
            status: "All",
            priority: "All",
            category: "All",
          },
        });
        get().applyFilters();
      },

      // Loading actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Utility actions
      getTaskById: (id) => {
        const state = get();
        return state.tasks.find((task) => task.id === id);
      },

      getTasksByStatus: (status) => {
        const state = get();
        return state.tasks.filter((task) => task.status === status);
      },

      getTasksByPriority: (priority) => {
        const state = get();
        return state.tasks.filter((task) => task.priority === priority);
      },
    }),
    {
      name: "my-tasks-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        total: state.total,
        metrics: state.metrics,
        // Don't persist loading states, errors, or filters
      }),
    }
  )
);
