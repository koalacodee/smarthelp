import { create } from "zustand";
import { Vehicle } from "@/lib/api";

interface CurrentEditingVehicleState {
  vehicle: Vehicle | null;
  isEditing: boolean;
  setVehicle: (vehicle: Vehicle | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useCurrentEditingVehicleStore = create<CurrentEditingVehicleState>(
  (set) => ({
    vehicle: null,
    isEditing: false,
    setVehicle: (vehicle) => set({ vehicle }),
    setIsEditing: (isEditing) => set({ isEditing }),
  })
);
