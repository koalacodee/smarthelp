"use client";

import { Department } from "@/lib/api/departments";
import { create } from "zustand";

interface DepartmentsState {
  departments: Department[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  setDepartments: (departments: Department[]) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
}

export const useDepartmentsStore = create<DepartmentsState>((set) => ({
  departments: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  setDepartments: (departments) => set({ departments }),

  addDepartment: (department) =>
    set((state) => ({
      departments: [...state.departments, department],
    })),

  updateDepartment: (id, updatedDepartment) =>
    set((state) => ({
      departments: state.departments.map((dept) =>
        dept.id === id ? { ...dept, ...updatedDepartment } : dept
      ),
    })),

  deleteDepartment: (id) =>
    set((state) => ({
      departments: state.departments.filter((dept) => dept.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setCreating: (isCreating) => set({ isCreating }),
  setUpdating: (isUpdating) => set({ isUpdating }),
  setDeleting: (isDeleting) => set({ isDeleting }),
}));
