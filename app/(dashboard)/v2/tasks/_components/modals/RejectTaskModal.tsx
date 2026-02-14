"use client";

import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useRejectTask } from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import ModalShell from "./ModalShell";
import type { TaskResponse } from "@/services/tasks/types";

export default function RejectTaskModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const rejectMutation = useRejectTask();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const task = modalPayload as TaskResponse | null;
  const isOpen = activeModal === "reject-task" && !!task;

  const handleClose = () => {
    setReason("");
    setError("");
    closeModal();
  };

  const handleSubmit = async () => {
    if (!task) return;
    setError("");
    try {
      await rejectMutation.mutateAsync({
        taskId: task.id,
        data: { reason: reason.trim() || undefined },
      });
      addToast({
        message: locale?.tasks.toasts?.taskRejected ?? "Task rejected",
        type: "success",
      });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to reject task");
    }
  };

  if (!locale) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} size="sm">
      <DialogTitle
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        {locale.tasks.modals.rejection?.title ?? "Reject Task"}
      </DialogTitle>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <span>{error}</span>
        </div>
      )}
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale.tasks.modals.rejection?.fields.reason ?? "Reason"}
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder={
              locale.tasks.modals.rejection?.fields.reasonPlaceholder ??
              "Provide a reason for rejection..."
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {locale.tasks.modals.rejection?.buttons.cancel ?? "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rejectMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {rejectMutation.isPending
              ? (locale?.tasks.modals.rejection?.buttons.rejecting ??
                "Rejecting...")
              : (locale?.tasks.modals.rejection?.buttons.reject ?? "Reject")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
