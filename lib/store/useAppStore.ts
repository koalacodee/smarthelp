import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppNotification } from "@/types";

// Global UI state
interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id">) => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
}

// Global app state
interface AppState {
  // App initialization
  isInitialized: boolean;
  setInitialized: (initialized: boolean) => void;

  // Current user
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;

  // App settings
  settings: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  updateSettings: (settings: Partial<AppState["settings"]>) => void;
}

// Modal states
interface ModalState {
  // Global modals
  confirmationModal: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };

  openConfirmationModal: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  closeConfirmationModal: () => void;
}

// Toast messages
interface ToastState {
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number;
  }>;

  addToast: (toast: Omit<ToastState["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Combined store
interface GlobalStore extends UIState, AppState, ModalState, ToastState {}

export const useAppStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      // UI State
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      theme: "system",
      setTheme: (theme) => set({ theme }),

      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // App State
      isInitialized: false,
      setInitialized: (initialized) => set({ isInitialized: initialized }),

      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      settings: {
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Modal State
      confirmationModal: {
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        onConfirm: undefined,
        onCancel: undefined,
      },
      openConfirmationModal: (options) =>
        set({
          confirmationModal: {
            isOpen: true,
            title: options.title,
            message: options.message,
            confirmText: options.confirmText || "Confirm",
            cancelText: options.cancelText || "Cancel",
            onConfirm: options.onConfirm,
            onCancel: options.onCancel,
          },
        }),
      closeConfirmationModal: () =>
        set({
          confirmationModal: {
            isOpen: false,
            title: "",
            message: "",
            confirmText: "Confirm",
            cancelText: "Cancel",
            onConfirm: undefined,
            onCancel: undefined,
          },
        }),

      // Toast State
      toasts: [],
      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        settings: state.settings,
        sidebarOpen: state.sidebarOpen,
        // Don't persist notifications, modals, or user data
      }),
    }
  )
);
