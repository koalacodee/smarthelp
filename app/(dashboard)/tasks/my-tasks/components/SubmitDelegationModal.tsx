"use client";
import React, { useState, useEffect } from "react";
import { useSubmitDelegationModalStore } from "@/app/(dashboard)/store/useSubmitDelegationModalStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { TaskDelegationService } from "@/lib/api/v2";
import useFormErrors from "@/hooks/useFormErrors";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import { useAttachments } from "@/hooks/useAttachments";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function SubmitDelegationModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "notes",
  ]);
  const {
    isOpen,
    delegation,
    notes,
    isSubmitting,
    closeModal,
    setNotes,
    setIsSubmitting,
  } = useSubmitDelegationModalStore();

  const [uploadKeyV3, setUploadKeyV3] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isWaitingToClose, setIsWaitingToClose] = useState(false);
  const [hasStartedUpload, setHasStartedUpload] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [hasFilesToUpload, setHasFilesToUpload] = useState(false);
  const { reset } = useAttachments();
  const { addToast } = useToastStore();

  if (!locale) return null;

  const handleClose = () => {
    closeModal();
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

  if (!isOpen || !delegation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!notes?.trim()) {
      setRootError(locale.tasks.delegations.toasts.addNotes);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await TaskDelegationService.submitForReview(
        delegation.id,
        {
          notes: notes,
          chooseAttachments:
            selectedAttachments.length > 0 ? selectedAttachments : undefined,
        },
        hasFilesToUpload
      );

      const fileHubUploadKey = response.fileHubUploadKey;

      addToast({
        message: locale.tasks.delegations.toasts.submitSuccess,
        type: "success",
      });

      if (hasFilesToUpload) {
        if (fileHubUploadKey) {
          try {
            setUploadKeyV3(fileHubUploadKey);
          } catch (uploadErr: any) {
            addToast({
              message:
                uploadErr?.message ||
                locale.tasks.delegations.toasts.uploadFailed,
              type: "error",
            });
          }
        } else {
          addToast({
            message: locale.tasks.delegations.toasts.missingUploadKey,
            type: "error",
          });
        }
        setIsWaitingToClose(true);
      } else {
        handleClose();
      }
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            locale.tasks.delegations.toasts.submitFailed
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskTitle = delegation.task?.title || "Task";

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          {locale.tasks.modals.submitDelegation.title}: {taskTitle}
        </h3>

        {errors.root && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{errors.root}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <p className="font-semibold text-sm text-slate-600">
              {locale.tasks.modals.submitWork.fields.description}
            </p>
            <p className="text-slate-800 whitespace-pre-wrap">
              {delegation.task?.description ||
                locale.tasks.modals.submitWork.fields.noDescription}
            </p>
          </div>
          {delegation.targetSubDepartment && (
            <div>
              <p className="font-semibold text-sm text-slate-600">
                {locale.tasks.teamTasks.card.assignedTo}
              </p>
              <p className="text-slate-800">
                {delegation.assignmentType === "INDIVIDUAL" &&
                delegation.assignee
                  ? `${delegation.assignee.user?.name || "Employee"}`
                  : delegation.targetSubDepartment.name}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="delegation-notes"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {locale.tasks.modals.submitDelegation.fields.notes}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="delegation-notes"
              rows={3}
              className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                locale.tasks.modals.submitDelegation.fields.notesPlaceholder
              }
              value={notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-700">{errors.notes}</p>
            )}
          </div>

          <AttachmentInputV3
            uploadKey={uploadKeyV3 ?? undefined}
            uploadWhenKeyProvided={true}
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
              onClick={closeModal}
              className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              {locale.tasks.modals.submitDelegation.buttons.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              {isSubmitting
                ? locale.tasks.modals.submitDelegation.buttons.submitting
                : locale.tasks.modals.submitDelegation.buttons.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
