import { create } from "zustand";

export type ModalType =
  | "add-task"
  | "edit-task"
  | "task-detail"
  | "submit-work"
  | "presets"
  | "create-from-preset"
  | "approve-submission"
  | "reject-submission"
  | "reject-task"
  | "delegation"
  | "submit-delegation"
  | "forward-delegation";

interface Department {
  id: string;
  name: string;
}

interface SubDepartment {
  id: string;
  name: string;
}

interface ServerHydrationData {
  role: "admin" | "supervisor" | "employee";
  departments: Department[];
  subDepartments: SubDepartment[];
}

interface V2TaskPageStore {
  // ── Modal State ─────────────────────────────────────────────
  activeModal: ModalType | null;
  modalPayload: unknown;
  openModal: (type: ModalType, payload?: unknown) => void;
  closeModal: () => void;

  // ── Server Data ─────────────────────────────────────────────
  role: "admin" | "supervisor" | "employee";
  departments: Department[];
  subDepartments: SubDepartment[];
  setServerData: (data: ServerHydrationData) => void;

  // ── Pagination ──────────────────────────────────────────────
  cursor: string | undefined;
  direction: "next" | "prev" | undefined;
  setCursor: (cursor: string | undefined, direction: "next" | "prev") => void;
  resetCursor: () => void;

  // ── Expanded State ──────────────────────────────────────────
  expandedSubmissions: Set<string>;
  toggleSubmissions: (taskId: string) => void;
  expandedFeedback: Set<string>;
  toggleFeedback: (taskId: string) => void;
}

export const useV2TaskPageStore = create<V2TaskPageStore>((set) => ({
  // ── Modal ────────────────────────────────────────────────────
  activeModal: null,
  modalPayload: null,
  openModal: (type, payload) =>
    set({ activeModal: type, modalPayload: payload ?? null }),
  closeModal: () => set({ activeModal: null, modalPayload: null }),

  // ── Server Data ──────────────────────────────────────────────
  role: "employee",
  departments: [],
  subDepartments: [],
  setServerData: ({ role, departments, subDepartments }) =>
    set({ role, departments, subDepartments }),

  // ── Pagination ───────────────────────────────────────────────
  cursor: undefined,
  direction: undefined,
  setCursor: (cursor, direction) => set({ cursor, direction }),
  resetCursor: () => set({ cursor: undefined, direction: undefined }),

  // ── Expanded State ───────────────────────────────────────────
  expandedSubmissions: new Set(),
  toggleSubmissions: (taskId) =>
    set((state) => {
      const next = new Set(state.expandedSubmissions);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return { expandedSubmissions: next };
    }),
  expandedFeedback: new Set(),
  toggleFeedback: (taskId) =>
    set((state) => {
      const next = new Set(state.expandedFeedback);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return { expandedFeedback: next };
    }),
}));
