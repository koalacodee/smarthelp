import { create } from 'zustand';
import { Department } from '@/lib/api/departments';

interface SubDepartmentsStore {
  subDepartments: Department[];
  isLoading: boolean;
  error: string | null;
  setSubDepartments: (subDepartments: Department[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addSubDepartment: (subDepartment: Department) => void;
  updateSubDepartment: (id: string, subDepartment: Department) => void;
  deleteSubDepartment: (id: string) => void;
}

export const useSubDepartmentsStore = create<SubDepartmentsStore>((set) => ({
  subDepartments: [],
  isLoading: false,
  error: null,
  setSubDepartments: (subDepartments) => set({ subDepartments }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  addSubDepartment: (subDepartment) => set((state) => ({
    subDepartments: [...state.subDepartments, subDepartment]
  })),
  updateSubDepartment: (id, updatedSubDepartment) => set((state) => ({
    subDepartments: state.subDepartments.map(sd => 
      sd.id === id ? updatedSubDepartment : sd
    )
  })),
  deleteSubDepartment: (id) => set((state) => ({
    subDepartments: state.subDepartments.filter(sd => sd.id !== id)
  })),
}));
