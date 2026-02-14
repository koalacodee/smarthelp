"use client";

import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useSubmitTaskForReview } from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useAttachments } from "@/hooks/useAttachments";
import { useTaskStore } from "@/services/tasks/store";
import ModalShell from "./ModalShell";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import type { TaskResponse } from "@/services/tasks/types";

export default function SubmitWorkModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const submitMutation = useSubmitTaskForReview();
  const { fileHubUploadKey } = useTaskStore();
  const { selectedFormMyAttachments, attachmentsToUpload } = useAttachments();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const task = modalPayload as TaskResponse | null;
  const isOpen = activeModal === "submit-work" && !!task;

  const handleClose = () => {
    setNotes("");
    setError("");
    closeModal();
  };

  const handleSubmit = async () => {
    if (!task) return;
    setError("");
    try {
      await submitMutation.mutateAsync({
        taskId: task.id,
        data: {
          notes: notes.trim() || undefined,
          attach: attachmentsToUpload.length > 0,
          chooseAttachments:
            selectedFormMyAttachments.length > 0
              ? selectedFormMyAttachments.map((a) => a.id)
              : undefined,

        },
      });
      addToast({
        message: locale?.tasks.toasts?.workSubmitted ?? "Work submitted",
        type: "success",
      });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to submit work");
    }
  };

  if (!locale) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} size="md">
      <DialogTitle as="h3" className="text-xl font-bold mb-4 text-slate-800">
        {locale.tasks.modals.submitWork?.title ?? "Submit Work"}
      </DialogTitle>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <span>{error}</span>
        </div>
      )}
      {task && (
        <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700">{task.title}</p>
          <p className="text-xs text-slate-500">{task.description}</p>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the work you've done..."
          />
        </div>
        <AttachmentInputV3 uploadKey={fileHubUploadKey ?? undefined} uploadWhenKeyProvided={true} />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
