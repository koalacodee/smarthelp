import { Vehicle, VehicleStatus } from "@/lib/api";
import { create } from "zustand";

interface VehicleStore {
  vehicles: Vehicle[];
  hoveredVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;

  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updated: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  updateStatus: (id: string, status: VehicleStatus) => void;
  setHoveredVehicle: (id: string | null) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: [],
  loading: false,
  error: null,
  hoveredVehicle: null,

  setVehicles: (vehicles) => set({ vehicles }),
  addVehicle: (vehicle) =>
    set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
  updateVehicle: (id, updated) =>
    set((state) => ({
      vehicles: state.vehicles.map((t) =>
        t.id === id
          ? { ...t, ...updated, updatedAt: new Date().toISOString() }
          : t
      ),
    })),

  removeVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((t) => t.id !== id),
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      vehicles: state.vehicles.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      ),
    })),
  setHoveredVehicle: (id) =>
    set((state) => ({
      hoveredVehicle: id ? state.vehicles.find((t) => t.id == id) : null,
    })),
}));
