"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useSubmitTaskForReview } from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useAttachments } from "@/hooks/useAttachments";
import { useTaskStore } from "@/services/tasks/store";
import { TaskDelegationService } from "@/lib/api/v2";
import { taskKeys } from "@/services/tasks";
import ModalShell from "./ModalShell";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import type { UnifiedMyTaskItemResponse } from "@/services/tasks/types";

export default function SubmitWorkModal() {
  const locale = useLocaleStore((state) => state.locale);
  const queryClient = useQueryClient();
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const submitTaskMutation = useSubmitTaskForReview();
  const { fileHubUploadKey, setFileHubUploadKey } = useTaskStore();
  const { selectedFormMyAttachments, attachmentsToUpload } = useAttachments();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isDelegationSubmitting, setIsDelegationSubmitting] = useState(false);

  const item = modalPayload as UnifiedMyTaskItemResponse | null;
  const task = item?.task ?? null;
  const isOpen = activeModal === "submit-work" && !!item && !!task;

  const handleClose = () => {
    setNotes("");
    setError("");
    setIsDelegationSubmitting(false);
    closeModal();
  };

  const handleSubmit = async () => {
    if (!item || !task) return;
    setError("");
    try {
      if (item.type === "task") {
        await submitTaskMutation.mutateAsync({
          taskId: item.taskId,
          data: {
            notes: notes.trim() || undefined,
            attach: attachmentsToUpload.length > 0,
            chooseAttachments:
              selectedFormMyAttachments.length > 0
                ? selectedFormMyAttachments.map((a) => a.id)
                : undefined,
          },
        });
        queryClient.invalidateQueries({
          queryKey: [...taskKeys.all, "my-tasks"],
        });
      } else if (item.type === "delegation" && item.delegationId) {
        setIsDelegationSubmitting(true);
        const response = await TaskDelegationService.submitForReview(
          item.delegationId,
          {
            notes: notes.trim() || undefined,
            chooseAttachments:
              selectedFormMyAttachments.length > 0
                ? selectedFormMyAttachments.map((a) => a.id)
                : undefined,
          },
          attachmentsToUpload.length > 0,
        );
        queryClient.invalidateQueries({
          queryKey: [...taskKeys.all, "my-tasks"],
        });
        if (attachmentsToUpload.length > 0 && (response.fileHubUploadKey ?? response.uploadKey)) {
          setFileHubUploadKey(response.fileHubUploadKey ?? response.uploadKey!);
        }
      }
      addToast({
        message: locale?.tasks.toasts?.workSubmitted ?? "Work submitted",
        type: "success",
      });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to submit work");
    } finally {
      setIsDelegationSubmitting(false);
    }
  };

  const isPending =
    submitTaskMutation.isPending || isDelegationSubmitting;

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
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
