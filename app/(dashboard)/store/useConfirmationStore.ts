import { create } from "zustand";

type ConfirmationModalOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

interface ConfirmationModalState extends ConfirmationModalOptions {
  isOpen: boolean;
  openModal: (options: ConfirmationModalOptions) => void;
  closeModal: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>(
  (set) => ({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: undefined,
    onCancel: undefined,

    openModal: (options) =>
      set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      }),

    closeModal: () =>
      set({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        onConfirm: undefined,
        onCancel: undefined,
      }),
  })
);
