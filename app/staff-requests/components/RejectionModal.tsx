"use client";
import { useRejectionModalStore } from "@/app/store/useRejectionModalStore";
import { useToastStore } from "@/app/store/useToastStore";
import api from "@/lib/api";
import { useState } from "react";

export default function RejectionModal() {
  const {
    isOpen,
    requestId,
    employeeName,
    rejectionReason,
    closeModal,
    setRejectionReason,
    clearRejectionReason,
  } = useRejectionModalStore();

  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rejectionReason.trim() || !requestId) return;

    setIsSubmitting(true);
    try {
      await api.EmployeeRequestsService.rejectEmployeeRequest(requestId, {
        rejectionReason: rejectionReason.trim(),
      });

      addToast({ message: "Request rejected successfully", type: "success" });
      closeModal();
      clearRejectionReason();
    } catch (error) {
      addToast({ message: "Failed to reject request", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Reject Request
          </h3>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to reject the request for{" "}
            <strong>{employeeName}</strong>?
          </p>

          <label
            htmlFor="rejection-reason"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Rejection Reason *
          </label>
          <textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            placeholder="Please provide a detailed reason for rejection..."
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rejectionReason.trim() || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSubmitting ? "Rejecting..." : "Reject Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
