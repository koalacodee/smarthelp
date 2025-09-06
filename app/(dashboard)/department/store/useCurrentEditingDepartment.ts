"use client";

import { Department } from "@/lib/api/departments";
import { create } from "zustand";

interface CurrentEditingDepartmentState {
  department: Department | null;
  isOpen: boolean;
  mode: "add" | "edit";
  setDepartment: (department: Department | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  setMode: (mode: "add" | "edit") => void;
  openModal: (mode: "add" | "edit", department: Department | null) => void;
  closeModal: () => void;
}

export const useCurrentEditingDepartment = create<CurrentEditingDepartmentState>((set) => ({
  department: null,
  isOpen: false,
  mode: "add",
  setDepartment: (department) => set({ department }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setMode: (mode) => set({ mode }),
  openModal: (mode, department) => set({ department, mode, isOpen: true }),
  closeModal: () => set({ isOpen: false, department: null }),
}));
