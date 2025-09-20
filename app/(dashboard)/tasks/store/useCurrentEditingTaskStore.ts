import { create } from "zustand";
import { Task } from "@/lib/api/tasks";

interface CurrentEditingTaskState {
  task: Task | null;
  isEditing: boolean;

  setTask: (task: Task | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useCurrentEditingTaskStore = create<CurrentEditingTaskState>(
  (set) => ({
    task: null,
    isEditing: false,
    setTask: (task) => set({ task }),
    setIsEditing: (isEditing) => set({ isEditing }),
  })
);
