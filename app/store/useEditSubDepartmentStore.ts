import { create } from 'zustand';
import { Department } from '@/lib/api/departments';

interface EditSubDepartmentState {
  isOpen: boolean;
  currentSubDepartment: Department | null;
  openModal: (subDepartment: Department) => void;
  closeModal: () => void;
}

export const useEditSubDepartmentStore = create<EditSubDepartmentState>((set) => ({
  isOpen: false,
  currentSubDepartment: null,
  openModal: (subDepartment) => set({ isOpen: true, currentSubDepartment: subDepartment }),
  closeModal: () => set({ isOpen: false, currentSubDepartment: null }),
}));
