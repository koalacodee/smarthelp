import { create } from "zustand";
import { Datum as Supervisor } from "@/lib/api/supervisors";

interface CurrentEditingSupervisorState {
  supervisor: Supervisor | null;
  isEditing: boolean;
  isDelegating: boolean;
  setSupervisor: (supervisor: Supervisor | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  setIsDelegating: (isDelegating: boolean) => void;
}

export const useCurrentEditingSupervisorStore =
  create<CurrentEditingSupervisorState>((set) => ({
    supervisor: null,
    isEditing: false,
    isDelegating: false,
    setSupervisor: (supervisor) => set({ supervisor }),
    setIsEditing: (isEditing) => set({ isEditing }),
    setIsDelegating: (isDelegating) => set({ isDelegating }),
  }));
