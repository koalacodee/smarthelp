import { create } from "zustand";
import { Datum, Task } from "@/lib/api/tasks";

type TaskType = Datum | Task;

interface TasksStore {
  tasks: TaskType[];
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTask: (task: Task) => void;
  addTasks: (task: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setTasks: (tasks: TaskType[]) => void;
  clearTasks: () => void;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks(tasks) {
    set(() => ({ tasks }));
  },

  clearTasks() {
    set(() => ({ tasks: [] }));
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  addTask: (task) => {
    set((state) => {
      return { tasks: [...state.tasks, task] };
    });
  },
  addTasks: (tasks) => {
    set((state) => {
      return { tasks: [...state.tasks, ...tasks] };
    });
  },
  updateTask: (taskId, updates) => {
    set((state) => {
      const updateTaskInList = (tasks: Task[]) =>
        tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        );

      return {
        tasks: updateTaskInList(state.tasks),
      };
    });
  },
  deleteTask(taskId: string) {
    set((state) => {
      const deleteTaskInList = (tasks: Task[]) =>
        tasks.filter((task) => task.id !== taskId);

      return {
        tasks: deleteTaskInList(state.tasks),
      };
    });
  },
}));
