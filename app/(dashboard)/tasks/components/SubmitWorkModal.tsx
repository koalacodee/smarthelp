"use client";
import React, { useState } from "react";
import { useSubmitWorkModalStore } from "@/app/(dashboard)/store/useSubmitWorkModalStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import AttachmentInput from "@/components/ui/AttachmentInput";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import { useMyTasksStore } from "../my-tasks/store/useMyTasksStore";
import { useAdminTasksStore } from "../store/useAdminTasksStore";
import { TaskStatus } from "@/lib/api/tasks";
import useFormErrors from "@/hooks/useFormErrors";

export default function SubmitWorkModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "notes",
  ]);
  const { isOpen, task, isSubmitting, closeModal, setNotes, setIsSubmitting } =
    useSubmitWorkModalStore();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { getFormData, selectedAttachmentIds, moveAllSelectedToExisting } =
    useAttachmentStore();

  const { addToast } = useToastStore();

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!task.notes?.trim()) {
      setRootError("Please add completion notes");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get FormData from attachment store
      const formData = attachments.length > 0 ? getFormData() : undefined;

      await api.TasksService.submitWork(
        task.id!,
        {
          notes: task.notes,
          chooseAttachments: Array.from(selectedAttachmentIds),
        },
        formData
      );
      // Optimistically update task status in any relevant store
      try {
        useMyTasksStore
          .getState()
          .updateTask(task.id!, { status: TaskStatus.PENDING_REVIEW });
      } catch {}
      try {
        useAdminTasksStore
          .getState()
          .updateTask(task.id!, { status: TaskStatus.PENDING_REVIEW });
      } catch {}
      addToast({
        message: "Task submitted for review successfully!",
        type: "success",
      });
      moveAllSelectedToExisting();
      closeModal();
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            "Failed to submit task for review. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          Submit Task for Review: {task.title}
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
            <p className="font-semibold text-sm text-slate-600">Description:</p>
            <p className="text-slate-800 whitespace-pre-wrap">
              {task.description || "No description provided"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="supervisor-notes"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Completion Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              id="supervisor-notes"
              rows={3}
              className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any comments or details about the task completion..."
              value={task.notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-700">{errors.notes}</p>
            )}
          </div>

          <AttachmentInput
            id="supervisor-task-attachment"
            onAttachmentsChange={setAttachments}
          />

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
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
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
