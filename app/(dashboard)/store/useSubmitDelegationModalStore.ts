import { create } from "zustand";
import { TaskDelegationDTO } from "@/lib/api/v2/services/delegations";

interface SubmitDelegationModalStore {
  isOpen: boolean;
  delegation: TaskDelegationDTO | null;
  notes?: string;
  isSubmitting: boolean;

  openModal: (delegation: TaskDelegationDTO) => void;
  closeModal: () => void;
  setNotes: (notes: string) => void;
  setIsSubmitting: (submitting: boolean) => void;
}

export const useSubmitDelegationModalStore = create<SubmitDelegationModalStore>((set) => ({
  isOpen: false,
  delegation: null,
  notes: undefined,
  isSubmitting: false,

  openModal: (delegation) => set({ isOpen: true, delegation, notes: undefined }),
  closeModal: () => set({ isOpen: false, delegation: null, notes: undefined }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setNotes: (notes) => set({ notes }),
}));


