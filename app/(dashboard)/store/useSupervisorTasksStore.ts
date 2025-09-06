import { create } from "zustand";
import api from "@/lib/api";
import { Datum, Task, TaskStatus } from "@/lib/api/tasks";

type SubDepartmentTask = Omit<Task, "targetDepartment">;
type EmployeeTask = Datum;

interface SupervisorTasksStore {
  // State
  subDepartmentTasks: SubDepartmentTask[];
  employeeTasks: Datum[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubDepartmentTasks: () => Promise<void>;
  fetchEmployeeTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSupervisorTasksStore = create<SupervisorTasksStore>(
  (set, get) => ({
    subDepartmentTasks: [],
    employeeTasks: [],
    isLoading: false,
    error: null,

    fetchSubDepartmentTasks: async () => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.TasksService.getSubDepartmentLevel();

        const tasks: SubDepartmentTask[] = response.data;

        set({ subDepartmentTasks: tasks, isLoading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch sub-department tasks",
          isLoading: false,
        });
      }
    },

    fetchEmployeeTasks: async () => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.TasksService.getEmployeeLevel();

        const tasks: EmployeeTask[] = response.data;

        set({ employeeTasks: tasks, isLoading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch employee tasks",
          isLoading: false,
        });
      }
    },

    refreshTasks: async () => {
      const { fetchSubDepartmentTasks, fetchEmployeeTasks } = get();
      await Promise.all([fetchSubDepartmentTasks(), fetchEmployeeTasks()]);
    },

    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
  })
);
