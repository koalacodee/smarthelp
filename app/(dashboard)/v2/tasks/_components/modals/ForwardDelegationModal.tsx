"use client";

import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useForwardDelegationSubmission } from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import ModalShell from "./ModalShell";
import type { TaskDelegationSubmissionResponse } from "@/services/tasks/types";

export default function ForwardDelegationModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const forwardMutation = useForwardDelegationSubmission();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submission = modalPayload as TaskDelegationSubmissionResponse | null;
  const isOpen = activeModal === "forward-delegation" && !!submission;

  const handleClose = () => {
    setMessage("");
    setError("");
    closeModal();
  };

  const handleSubmit = async () => {
    if (!submission) return;
    setError("");
    try {
      await forwardMutation.mutateAsync(
        submission.id,
      );
      addToast({
        message:
          locale?.tasks.delegations?.toasts?.forwardSuccess ?? "Submission forwarded",
        type: "success",
      });
      handleClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to forward submission",
      );
    }
  };

  if (!locale) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} size="sm">
      <DialogTitle
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        {locale.tasks.delegations?.card?.forward ?? "Forward Submission"}
      </DialogTitle>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <span>{error}</span>
        </div>
      )}
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale.tasks.delegations?.modals?.forward?.message ??
              "Message (optional)"}
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={
              locale.tasks.delegations?.modals?.forward?.messagePlaceholder ??
              "Add a note for the recipient..."
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {locale.tasks.delegations?.modals?.forward?.cancel ?? "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={forwardMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {forwardMutation.isPending
              ? (locale.tasks.delegations?.modals?.forward?.forwarding ??
                "Forwarding...")
              : (locale.tasks.delegations?.modals?.forward?.forward ??
                "Forward")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
