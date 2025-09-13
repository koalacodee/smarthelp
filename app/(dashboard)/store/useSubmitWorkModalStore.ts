import { create } from "zustand";

type TaskType = {
  id: string;
  notes?: string;
  title?: string;
  description?: string;
};

interface SubmitWorkModalStore {
  isOpen: boolean;
  task: TaskType | null;
  attachment: File | null;
  isSubmitting: boolean;

  openModal: (task: TaskType) => void;
  closeModal: () => void;
  setNotes: (notes: string) => void;
  setAttachment: (file: File | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
}

export const useSubmitWorkModalStore = create<SubmitWorkModalStore>((set) => ({
  isOpen: false,
  task: null,
  attachment: null,
  isSubmitting: false,

  openModal: (task) => set({ isOpen: true, task, attachment: null }),
  closeModal: () => set({ isOpen: false, task: null, attachment: null }),
  setAttachment: (attachment) => set({ attachment }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setNotes: (notes) =>
    set((state) => {
      state.task!.notes = notes;
      return state;
    }),
}));
