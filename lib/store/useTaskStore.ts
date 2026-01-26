import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Datum, Task } from "@/lib/api/tasks";

type TaskType = Datum | Task;

interface TaskFilters {
  search: string;
  status: string;
  priority: string;
  assignee: string;
}

interface TaskStore {
  // Data
  tasks: TaskType[];
  filteredTasks: TaskType[];
  filters: TaskFilters;
  meta: {
    nextCursor?: string;
    prevCursor?: string;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error handling
  error: string | null;

  // Actions
  setTasks: (tasks: TaskType[], meta?: any) => void;
  addTask: (task: TaskType) => void;
  addTasks: (tasks: TaskType[]) => void;
  updateTask: (taskId: string, updates: Partial<TaskType>) => void;
  deleteTask: (taskId: string) => void;
  clearTasks: () => void;

  // Filter actions
  setFilters: (filters: Partial<TaskFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setError: (error: string | null) => void;

  // Utility actions
  getTaskById: (id: string) => TaskType | undefined;
  getTasksByStatus: (status: string) => TaskType[];
  getTasksByPriority: (priority: string) => TaskType[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      filteredTasks: [],
      filters: {
        search: "",
        status: "All",
        priority: "All",
        assignee: "All",
      },
      meta: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,

      // Data actions
      setTasks: (tasks, meta) => {
        set({ tasks, filteredTasks: tasks, meta: meta || null });
      },

      addTask: (task) => {
        set((state) => {
          const newTasks = [...state.tasks, task];
          return { tasks: newTasks };
        });
        get().applyFilters();
      },

      addTasks: (tasks) => {
        set((state) => {
          const newTasks = [...state.tasks, ...tasks];
          return { tasks: newTasks };
        });
        get().applyFilters();
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
        get().applyFilters();
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
        get().applyFilters();
      },

      clearTasks: () => set({ tasks: [], filteredTasks: [] }),

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

        // Assignee filter
        if (filters.assignee === "Assigned") {
          filtered = filtered.filter(
            (task) =>
              task.assignee ||
              (task as any).targetSubDepartment ||
              (task as any).targetDepartment
          );
        } else if (filters.assignee === "Unassigned") {
          filtered = filtered.filter(
            (task) =>
              !task.assignee &&
              !(task as any).targetSubDepartment &&
              !(task as any).targetDepartment
          );
        }

        set({ filteredTasks: filtered });
      },

      clearFilters: () => {
        set({
          filters: {
            search: "",
            status: "All",
            priority: "All",
            assignee: "All",
          },
        });
        get().applyFilters();
      },

      // Loading actions
      setLoading: (isLoading) => set({ isLoading }),
      setCreating: (isCreating) => set({ isCreating }),
      setUpdating: (isUpdating) => set({ isUpdating }),
      setDeleting: (isDeleting) => set({ isDeleting }),
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
      name: "task-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        // Don't persist loading states or errors
      }),
    }
  )
);
