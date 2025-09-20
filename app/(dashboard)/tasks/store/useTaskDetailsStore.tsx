import { create } from "zustand";

type TaskDetails = {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: string;
  priority: string;
  targetDepartment?: {
    name: string;
  };
  targetSubDepartment?: {
    name: string;
  };
  assignee?: {
    user: {
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
  attachments?: string[];
};

type TaskDetailsStore = {
  isOpen: boolean;
  currentTask: TaskDetails | null;
  openDetails: (task: TaskDetails) => void;
  closeDetails: () => void;
};

export const useTaskDetailsStore = create<TaskDetailsStore>((set) => ({
  isOpen: false,
  currentTask: null,
  openDetails: (task) => set({ isOpen: true, currentTask: task }),
  closeDetails: () => set({ isOpen: false, currentTask: null }),
}));
