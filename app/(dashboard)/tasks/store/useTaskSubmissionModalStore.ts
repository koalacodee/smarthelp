import { create } from "zustand";

interface TaskSubmissionModalStore {
  // Approval modal state
  isApprovalModalOpen: boolean;
  approvalSubmissionId: string | null;

  // Rejection modal state
  isRejectionModalOpen: boolean;
  rejectionSubmissionId: string | null;

  // Actions
  openApprovalModal: (submissionId: string) => void;
  closeApprovalModal: () => void;
  openRejectionModal: (submissionId: string) => void;
  closeRejectionModal: () => void;
}

export const useTaskSubmissionModalStore = create<TaskSubmissionModalStore>(
  (set) => ({
    isApprovalModalOpen: false,
    approvalSubmissionId: null,
    isRejectionModalOpen: false,
    rejectionSubmissionId: null,

    openApprovalModal: (submissionId) =>
      set({
        isApprovalModalOpen: true,
        approvalSubmissionId: submissionId,
      }),

    closeApprovalModal: () =>
      set({
        isApprovalModalOpen: false,
        approvalSubmissionId: null,
      }),

    openRejectionModal: (submissionId) =>
      set({
        isRejectionModalOpen: true,
        rejectionSubmissionId: submissionId,
      }),

    closeRejectionModal: () =>
      set({
        isRejectionModalOpen: false,
        rejectionSubmissionId: null,
      }),
  })
);
