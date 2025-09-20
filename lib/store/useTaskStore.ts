import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Datum, Task } from "@/lib/api/tasks";

type TaskType = Datum | Task;

interface TaskStore {
  // Data
  tasks: TaskType[];

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error handling
  error: string | null;

  // Actions
  setTasks: (tasks: TaskType[]) => void;
  addTask: (task: TaskType) => void;
  addTasks: (tasks: TaskType[]) => void;
  updateTask: (taskId: string, updates: Partial<TaskType>) => void;
  deleteTask: (taskId: string) => void;
  clearTasks: () => void;

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
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,

      // Data actions
      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      addTasks: (tasks) =>
        set((state) => ({
          tasks: [...state.tasks, ...tasks],
        })),

      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),

      clearTasks: () => set({ tasks: [] }),

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
