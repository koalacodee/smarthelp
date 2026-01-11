"use client";

import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import useFormErrors from "@/hooks/useFormErrors";
import { useTaskSubmissionModalStore } from "../store/useTaskSubmissionModalStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function TaskSubmissionApprovalModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "feedback",
  ]);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();
  const { isApprovalModalOpen, approvalSubmissionId, closeApprovalModal } =
    useTaskSubmissionModalStore();

  if (!locale) return null;

  const handleSubmit = async () => {
    clearErrors();
    if (!approvalSubmissionId) {
      setRootError("Submission ID is missing");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.TasksService.approveTaskSubmission({
        taskSubmissionId: approvalSubmissionId,
        feedback: feedback.trim() || undefined,
      });
      addToast({
        message: locale.tasks.toasts.approvalSuccess,
        type: "success",
      });
      setFeedback("");
      closeApprovalModal();
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            locale.tasks.toasts.approvalFailed
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback("");
    clearErrors();
    closeApprovalModal();
  };

  return (
    <Transition appear show={isApprovalModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {locale.tasks.modals.approval.title}
                </DialogTitle>

                {errors.root && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
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

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="feedback"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Feedback (Optional)
                    </label>
                    <textarea
                      id="feedback"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add any feedback or comments..."
                    />
                    {errors.feedback && (
                      <p className="mt-1 text-sm text-red-700">
                        {errors.feedback}
                      </p>
                    )}
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
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? locale.tasks.modals.approval.buttons.approving : locale.tasks.modals.approval.buttons.approve}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
