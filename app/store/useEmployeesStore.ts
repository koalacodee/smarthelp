import { create } from 'zustand';
import { Entity } from '@/lib/api/employees';

interface EmployeesStore {
  employees: Entity[];
  isLoading: boolean;
  error: string | null;
  setEmployees: (employees: Entity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addEmployee: (employee: Entity) => void;
  updateEmployee: (id: string, employee: Entity) => void;
  deleteEmployee: (id: string) => void;
}

export const useEmployeesStore = create<EmployeesStore>((set) => ({
  employees: [],
  isLoading: false,
  error: null,
  setEmployees: (employees) => set({ employees }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addEmployee: (employee) => set((state) => ({
    employees: [...state.employees, employee]
  })),
  updateEmployee: (id, updatedEmployee) => set((state) => ({
    employees: state.employees.map(emp => 
      emp.id === id ? updatedEmployee : emp
    )
  })),
  deleteEmployee: (id) => set((state) => ({
    employees: state.employees.filter(emp => emp.id !== id)
  })),
}));
