"use client";

import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import {
  useApproveTaskSubmission,
  useApproveDelegationSubmission,
} from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import ModalShell from "./ModalShell";
import type {
  TaskSubmissionResponse,
  TaskDelegationSubmissionResponse,
} from "@/services/tasks/types";

export default function ApproveSubmissionModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const approveTaskMutation = useApproveTaskSubmission();
  const approveDelegationMutation = useApproveDelegationSubmission();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const submission = modalPayload as
    | TaskSubmissionResponse
    | TaskDelegationSubmissionResponse
    | null;
  const isOpen = activeModal === "approve-submission" && !!submission;
  const isDelegation = submission && "delegationId" in submission;
  const approveMutation = isDelegation
    ? approveDelegationMutation
    : approveTaskMutation;

  const handleClose = () => {
    setFeedback("");
    setError("");
    closeModal();
  };

  const handleSubmit = async () => {
    if (!submission) return;
    setError("");
    try {
      await approveMutation.mutateAsync({
        submissionId: submission.id,
        data: { feedback: feedback.trim() || undefined },
      });
      addToast({
        message: locale?.tasks.toasts?.approvalSuccess ?? "Submission approved",
        type: "success",
      });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to approve submission");
    }
  };

  if (!locale) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} size="sm">
      <DialogTitle
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        {locale.tasks.modals.approval.title}
      </DialogTitle>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <span>{error}</span>
        </div>
      )}
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale.tasks.modals.approval.fields.feedback}
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
            placeholder={
              locale.tasks.modals.approval.fields.feedbackPlaceholder
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {locale.tasks.modals.approval.buttons.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={approveMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {approveMutation.isPending
              ? locale.tasks.modals.approval.buttons.approving
              : locale.tasks.modals.approval.buttons.approve}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
