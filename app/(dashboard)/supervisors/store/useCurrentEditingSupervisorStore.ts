import { create } from "zustand";
import { Datum as Supervisor } from "@/lib/api/supervisors";

interface CurrentEditingSupervisorState {
  supervisor: Supervisor | null;
  isEditing: boolean;
  setSupervisor: (supervisor: Supervisor | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useCurrentEditingSupervisorStore = create<CurrentEditingSupervisorState>((set) => ({
  supervisor: null,
  isEditing: false,
  setSupervisor: (supervisor) => set({ supervisor }),
  setIsEditing: (isEditing) => set({ isEditing }),
}));
