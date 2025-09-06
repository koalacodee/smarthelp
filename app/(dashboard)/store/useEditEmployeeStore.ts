import { create } from 'zustand';
import { Entity, UpdateEmployeeDto } from '@/lib/api/employees';

interface EditEmployeeStore {
  isOpen: boolean;
  currentEmployee: Entity | null;
  formData: UpdateEmployeeDto;
  isSubmitting: boolean;
  openModal: (employee: Entity) => void;
  closeModal: () => void;
  setFormData: (data: Partial<UpdateEmployeeDto>) => void;
  setIsSubmitting: (submitting: boolean) => void;
}

export const useEditEmployeeStore = create<EditEmployeeStore>((set) => ({
  isOpen: false,
  currentEmployee: null,
  formData: {},
  isSubmitting: false,
  openModal: (employee) => set({ 
    isOpen: true, 
    currentEmployee: employee,
    formData: {
      jobTitle: employee.user.jobTitle,
      employeeId: employee.user.employeeId,
      subDepartmentIds: employee.subDepartments.map(sd => sd.id),
      permissions: employee.permissions
    }
  }),
  closeModal: () => set({ 
    isOpen: false, 
    currentEmployee: null, 
    formData: {} 
  }),
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
