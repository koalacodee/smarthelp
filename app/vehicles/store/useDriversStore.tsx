import { DriverProfile } from "@/lib/api";
import { create } from "zustand";

interface DriverStore {
  drivers: DriverProfile[];
  loading: boolean;
  error: string | null;

  setDrivers: (drivers: DriverProfile[]) => void;
  addDriver: (driver: DriverProfile) => void;
  updateDriver: (id: string, updated: Partial<DriverProfile>) => void;
  removeDriver: (id: string) => void;
}

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [],
  loading: false,
  error: null,

  setDrivers: (drivers) => set({ drivers }),
  addDriver: (driver) =>
    set((state) => ({ drivers: [...state.drivers, driver] })),
  updateDriver: (id, updated) =>
    set((state) => ({
      drivers: state.drivers.map((t) =>
        t.id === id
          ? { ...t, ...updated, updatedAt: new Date().toISOString() }
          : t
      ),
    })),
  removeDriver: (id) =>
    set((state) => ({
      drivers: state.drivers.filter((t) => t.id !== id),
    })),
}));
