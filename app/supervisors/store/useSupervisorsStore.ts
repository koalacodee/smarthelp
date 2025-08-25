import { Datum as Supervisor } from "@/lib/api/supervisors";
import { create } from "zustand";

interface SupervisorsState {
  supervisors: Supervisor[];
  setSupervisors: (supervisors: Supervisor[]) => void;
  addSupervisor: (supervisor: Supervisor) => void;
  updateSupervisor: (id: string, updated: Partial<Supervisor>) => void;
  removeSupervisor: (id: string) => void;
}

export const useSupervisorsStore = create<SupervisorsState>((set) => ({
  supervisors: [],

  setSupervisors: (supervisors) => set({ supervisors }),

  addSupervisor: (supervisor) =>
    set((state) => ({
      supervisors: [...state.supervisors, supervisor],
    })),

  updateSupervisor: (id, updated) =>
    set((state) => ({
      supervisors: state.supervisors.map((s) =>
        s.id === id ? { ...s, ...updated } : s
      ),
    })),

  removeSupervisor: (id) =>
    set((state) => ({
      supervisors: state.supervisors.filter((s) => s.id !== id),
    })),
}));
