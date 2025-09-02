"use client";
import { useToastStore } from "@/app/store/useToastStore";
import Toast from "./Toast";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-0 right-0 p-4 sm:p-6 z-[150] w-full max-w-sm pointer-events-none overflow-hidden"
    >
      <div className="flex flex-col items-end space-y-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
}
