import { create } from 'zustand';
import { Datum } from '@/lib/api/tasks';

interface SubmitWorkModalStore {
  isOpen: boolean;
  currentTask: Datum | null;
  notes: string;
  attachment: File | null;
  isSubmitting: boolean;
  
  openModal: (task: Datum) => void;
  closeModal: () => void;
  setNotes: (notes: string) => void;
  setAttachment: (file: File | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
}

export const useSubmitWorkModalStore = create<SubmitWorkModalStore>((set) => ({
  isOpen: false,
  currentTask: null,
  notes: '',
  attachment: null,
  isSubmitting: false,
  
  openModal: (task) => set({ isOpen: true, currentTask: task, notes: '', attachment: null }),
  closeModal: () => set({ isOpen: false, currentTask: null, notes: '', attachment: null }),
  setNotes: (notes) => set({ notes }),
  setAttachment: (attachment) => set({ attachment }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
