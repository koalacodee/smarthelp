"use client";

import { useState, useEffect } from "react";
import CheckCircle from "@/icons/CheckCircle";
import { useQueryClient } from "@tanstack/react-query";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import ModalShell from "../../_components/modals/ModalShell";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import { useAttachments } from "@/hooks/useAttachments";
import { TaskDelegationService } from "@/lib/api/v2";
import { taskKeys } from "@/services/tasks";
import type { DelegationResponse } from "@/services/tasks/types";

export default function SubmitDelegationModal() {
  const locale = useLocaleStore((s) => s.locale);
  const queryClient = useQueryClient();
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();
  const isOpen = activeModal === "submit-delegation";
  const delegation = modalPayload as DelegationResponse | null;

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadKeyV3, setUploadKeyV3] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isWaitingToClose, setIsWaitingToClose] = useState(false);
  const [hasStartedUpload, setHasStartedUpload] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [hasFilesToUpload, setHasFilesToUpload] = useState(false);
  const { reset } = useAttachments();

  const handleClose = () => {
    closeModal();
    setNotes("");
    setError(null);
    setUploadKeyV3(null);
    setIsUploading(false);
    setIsWaitingToClose(false);
    setHasStartedUpload(false);
    setSelectedAttachments([]);
    setHasFilesToUpload(false);
    reset();
  };

  useEffect(() => {
    if (hasStartedUpload && !isUploading && isWaitingToClose) {
      handleClose();
    }
  }, [hasStartedUpload, isUploading, isWaitingToClose]);

  if (!locale) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!notes.trim()) {
      setError(
        locale.tasks.delegations?.toasts?.addNotes ?? "Please add notes",
      );
      return;
    }

    if (!delegation) return;

    setIsSubmitting(true);
    try {
      const response = await TaskDelegationService.submitForReview(
        delegation.id,
        {
          notes,
          chooseAttachments:
            selectedAttachments.length > 0 ? selectedAttachments : undefined,
        },
        hasFilesToUpload,
      );

      const fileHubUploadKey = response.uploadKey;

      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, "my-tasks"],
      });
      if (hasFilesToUpload && fileHubUploadKey) {
        setUploadKeyV3(fileHubUploadKey);
        setIsWaitingToClose(true);
      } else {
        handleClose();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          locale.tasks.delegations?.toasts?.submitFailed ??
          "Submission failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          {locale.tasks.modals?.submitDelegation?.title ?? "Submit Delegation"}
        </h3>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="delegation-notes"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {locale.tasks.modals?.submitDelegation?.fields?.notes ?? "Notes"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="delegation-notes"
              rows={3}
              className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                locale.tasks.modals?.submitDelegation?.fields
                  ?.notesPlaceholder ?? "Enter your notes..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>

          <AttachmentInputV3
            uploadKey={uploadKeyV3 ?? undefined}
            uploadWhenKeyProvided
            onSelectedAttachmentsChange={(ids) =>
              setSelectedAttachments(Array.from(ids))
            }
            onUploadStart={() => {
              setHasStartedUpload(true);
              setIsUploading(true);
            }}
            onUploadEnd={() => setIsUploading(false)}
            onHasFilesToUpload={setHasFilesToUpload}
          />

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              {locale.tasks.modals?.submitDelegation?.buttons?.cancel ??
                "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting
                ? (locale.tasks.modals?.submitDelegation?.buttons?.submitting ??
                  "Submitting...")
                : (locale.tasks.modals?.submitDelegation?.buttons?.submit ??
                  "Submit")}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
