import { create } from "zustand";

interface CreateSubDepartmentState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useCreateSubDepartmentStore = create<CreateSubDepartmentState>(
  (set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
  })
);
