import { TaskPresetDTO } from "@/lib/api/v2/models/task";
import { create } from "zustand";

interface TaskPresetsStore {
  presets: TaskPresetDTO[];
  isLoading: boolean;
  isPresetsModalOpen: boolean;
  isCreateFromPresetModalOpen: boolean;
  selectedPreset: TaskPresetDTO | null;

  setPresets: (presets: TaskPresetDTO[]) => void;
  setLoading: (isLoading: boolean) => void;
  setPresetsModalOpen: (isOpen: boolean) => void;
  setCreateFromPresetModalOpen: (isOpen: boolean) => void;
  setSelectedPreset: (preset: TaskPresetDTO | null) => void;

  reset: () => void;
}

export const useTaskPresetsStore = create<TaskPresetsStore>((set) => ({
  presets: [],
  isLoading: false,
  isPresetsModalOpen: false,
  isCreateFromPresetModalOpen: false,
  selectedPreset: null,

  setPresets: (presets) => set({ presets }),
  setLoading: (isLoading) => set({ isLoading }),
  setPresetsModalOpen: (isOpen) => set({ isPresetsModalOpen: isOpen }),
  setCreateFromPresetModalOpen: (isOpen) =>
    set({ isCreateFromPresetModalOpen: isOpen }),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),

  reset: () =>
    set({
      selectedPreset: null,
      isPresetsModalOpen: false,
      isCreateFromPresetModalOpen: false,
    }),
}));
