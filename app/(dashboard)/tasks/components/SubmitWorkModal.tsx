import React from "react";
import { useSubmitWorkModalStore } from "@/app/(dashboard)/store/useSubmitWorkModalStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";

export default function SubmitWorkModal() {
  const {
    isOpen,
    currentTask,
    notes,
    attachment,
    isSubmitting,
    closeModal,
    setNotes,
    setAttachment,
    setIsSubmitting,
  } = useSubmitWorkModalStore();

  const { addToast } = useToastStore();

  if (!isOpen || !currentTask) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      addToast({ message: "Please add completion notes", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.TasksService.submitWork(currentTask.id!, { notes });
      addToast({
        message: "Task submitted for review successfully!",
        type: "success",
      });
      closeModal();
    } catch (error) {
      addToast({ message: "Failed to submit task for review", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          Submit Task for Review: {currentTask.title}
        </h3>

        <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <p className="font-semibold text-sm text-slate-600">Description:</p>
            <p className="text-slate-800 whitespace-pre-wrap">
              {currentTask.description || "No description provided"}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="supervisor-task-attachment"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Add Attachment (Optional)
            </label>
            <input
              id="supervisor-task-attachment"
              accept="*"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              type="file"
              onChange={handleFileChange}
            />
          </div>

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
