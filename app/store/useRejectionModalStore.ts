import { create } from 'zustand';

interface RejectionModalState {
  isOpen: boolean;
  requestId: string | null;
  employeeName: string;
  rejectionReason: string;
  
  openModal: (requestId: string, employeeName: string) => void;
  closeModal: () => void;
  setRejectionReason: (reason: string) => void;
  clearRejectionReason: () => void;
}

export const useRejectionModalStore = create<RejectionModalState>((set) => ({
  isOpen: false,
  requestId: null,
  employeeName: '',
  rejectionReason: '',
  
  openModal: (requestId, employeeName) => set({
    isOpen: true,
    requestId,
    employeeName,
    rejectionReason: ''
  }),
  
  closeModal: () => set({
    isOpen: false,
    requestId: null,
    employeeName: '',
    rejectionReason: ''
  }),
  
  setRejectionReason: (reason) => set({ rejectionReason: reason }),
  
  clearRejectionReason: () => set({ rejectionReason: '' })
}));
