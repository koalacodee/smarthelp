import { create } from 'zustand';
import type { TaskStatus, TaskPriority } from './types';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  departmentId?: string;
  subDepartmentId?: string;
  assigneeId?: string;
  dateRange?: { start?: Date; end?: Date };
}

type ActiveView =
  | 'my-tasks'
  | 'team-tasks'
  | 'department'
  | 'sub-department'
  | 'individual'
  | 'all';

interface TaskStoreState {
  // Active filters
  activeFilters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;

  // Selection state
  selectedTaskIds: Set<string>;
  toggleTaskSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // UI state
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Attachment upload key (set after create/update mutations that include attach: true)
  fileHubUploadKey: string | null;
  setFileHubUploadKey: (key: string) => void;
  clearFileHubUploadKey: () => void;
}

const initialFilters: TaskFilters = {};

export const useTaskStore = create<TaskStoreState>((set) => ({
  // ── Filters ────────────────────────────────────────────────────────
  activeFilters: initialFilters,

  setFilters: (filters) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...filters },
    })),

  resetFilters: () => set({ activeFilters: initialFilters }),

  // ── Selection ──────────────────────────────────────────────────────
  selectedTaskIds: new Set(),

  toggleTaskSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedTaskIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedTaskIds: next };
    }),

  selectAll: (ids) => set({ selectedTaskIds: new Set(ids) }),

  clearSelection: () => set({ selectedTaskIds: new Set() }),

  // ── View ───────────────────────────────────────────────────────────
  activeView: 'my-tasks',

  setActiveView: (view) => set({ activeView: view }),

  // ── Attachment Upload Key ────────────────────────────────────────
  fileHubUploadKey: null,

  setFileHubUploadKey: (key) => set({ fileHubUploadKey: key }),

  clearFileHubUploadKey: () => set({ fileHubUploadKey: null }),
}));
