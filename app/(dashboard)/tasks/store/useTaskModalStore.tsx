import { Department } from "@/lib/api/departments";
import { create } from "zustand";

interface TaskModalStore {
  isOpen: boolean;
  onClose: () => void;
  setOpen: (open: boolean) => void;
  subDepartments: Department[];
  departments: Department[];
  setDepartments: (departments: Department[]) => void;
  setSubDepartments: (departments: Department[]) => void;
}

export const useTaskModalStore = create<TaskModalStore>((set) => ({
  isOpen: false,
  subDepartments: [],
  departments: [],

  setDepartments: (departments) => set({ departments }),
  onClose: () => set({ isOpen: false }),
  setOpen: (open: boolean) => set({ isOpen: open }),
  setSubDepartments: (departments) => set({ subDepartments: departments }),
}));
