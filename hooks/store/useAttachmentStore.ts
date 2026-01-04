import { create } from "zustand";

export interface Attachment {
  originalName: string;
  filename: string;
  fileType: string; // Extension of the file
  size: number;
  isGlobal: boolean;
  expirationDate?: string | null;
  createdAt: string;
  signedUrl?: string;
  id: string;
  targetId?: string;
  userId?: string;
}

export interface AttachmentToUpload {
  file: File;
  isGlobal: boolean;
  expirationDate?: Date;
  filename: string;
  size: number;
  objectUrl: string;
  id: string;
  status: "queued" | "uploading" | "completed" | "failed";
}

interface AttachmentStore {
  myAttachments: Attachment[];
  setMyAttachments: (attachments: Attachment[]) => void;
  addMyAttachment: (attachment: Attachment) => void;
  removeMyAttachment: (attachmentId: string) => void;
  clearMyAttachments: () => void;

  // #region Existing Attachments
  existingAttachments: AttachmentMap;
  setExistingAttachmentsForTarget: (
    targetId: string,
    attachments: Attachment[]
  ) => void;
  addExistingAttachmentToTarget: (
    targetId: string,
    attachment: Attachment
  ) => void;
  removeExistingAttachmentFromTarget: (
    targetId: string,
    attachmentId: string
  ) => void;
  clearExistingAttachmentsForTarget: (targetId: string) => void;
  upsertExistingAttachmentForTarget: (
    targetId: string,
    attachment: Attachment
  ) => void;
  moveExistingAttachmentToDelete: (
    targetId: string,
    attachmentId: string
  ) => void;
  confirmExistingAttachmentsDeletionForTarget: (targetId: string) => void;
  // #endregion Existing Attachments

  // #region Attachments to Upload
  attachmentsToUpload: AttachmentToUploadMap;
  setAttachmentsToUploadForTarget: (
    targetId: string,
    attachments: AttachmentToUpload[]
  ) => void;
  addAttachmentToUploadForTarget: (
    targetId: string,
    attachment: AttachmentToUpload
  ) => void;
  removeAttachmentToUploadForTarget: (
    targetId: string,
    attachmentId: string
  ) => void;
  clearAttachmentsToUploadForTarget: (targetId: string) => void;
  updateAttachmentToUploadForTarget: (
    targetId: string,
    attachmentId: string,
    updates: Partial<AttachmentToUpload>
  ) => void;
  clearFailedAttachmentsToUploadForTarget: (targetId: string) => void;
  // #endregion Attachments to Upload

  // #region Current New Target Uploads
  currentNewTargetUploads: AttachmentToUpload[];
  addCurrentNewTargetUpload: (attachment: AttachmentToUpload) => void;
  removeCurrentNewTargetUpload: (attachmentId: string) => void;
  updateCurrentNewTargetUpload: (
    attachmentId: string,
    updates: Partial<AttachmentToUpload>
  ) => void;
  clearCurrentNewTargetUploads: () => void;
  moveCurrentNewTargetUploadsToTarget: (targetId: string) => void;
  // #endregion Current New Target Uploads

  // #region Attachments to Delete
  attachmentsToDelete: AttachmentMap;
  // alias for removeExistingAttachmentFromTarget
  deleteAttachmentFromExistingAttachments: (
    targetId: string,
    attachmentId: string
  ) => void;
  restoreAttachmentFromExistingAttachments: (
    targetId: string,
    attachmentId: string
  ) => void;
  clearAttachmentsToDelete: (targetId: string) => void;
  // #endregion Attachments to Delete

  // #region Selected Form My Attachments
  selectedFormMyAttachments: AttachmentMap;
  selectFormMyAttachmentForTarget: (
    targetId: string,
    attachmentId: string
  ) => void;
  deselectFormMyAttachmentForTarget: (
    targetId: string,
    attachmentId: string
  ) => void;
  toggleFormMyAttachmentSelectionForTarget: (
    targetId: string,
    attachmentId: string
  ) => void;
  clearSelectedAttachmentsForTarget: (targetId: string) => void;
  moveSelectedFormMyAttachmentsToExisting: (targetId: string) => void;
  // #endregion Selected Form My Attachments

  // #region Current New Target Selections
  currentNewTargetSelections: Attachment[];
  selectCurrentNewTargetAttachment: (attachmentId: string) => void;
  deselectCurrentNewTargetAttachment: (attachmentId: string) => void;
  toggleCurrentNewTargetAttachmentSelection: (attachmentId: string) => void;
  clearCurrentNewTargetSelections: () => void;
  moveCurrentNewTargetSelectionsToExisting: (targetId: string) => void;
  moveCurrentNewTargetSelectionsToTarget: (targetId: string) => void;
  // #endregion Current New Target Selections
}

// where `string` is the id of the target (e.g. task, faq, promotion)
export type AttachmentMap = Record<string, Attachment[]>;
// where `string` is the id of the target (e.g. task, faq, promotion)
export type AttachmentToUploadMap = Record<string, AttachmentToUpload[]>;

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  // Initial state
  myAttachments: [],
  existingAttachments: {},
  attachmentsToUpload: {},
  attachmentsToDelete: {},
  selectedFormMyAttachments: {},
  currentNewTargetUploads: [],
  currentNewTargetSelections: [],
  setMyAttachments: (attachments) => set({ myAttachments: attachments }),
  addMyAttachment: (attachment) =>
    set((state) => ({ myAttachments: [...state.myAttachments, attachment] })),
  removeMyAttachment: (attachmentId) =>
    set((state) => ({
      myAttachments: state.myAttachments.filter(
        (att) => att.id !== attachmentId
      ),
    })),
  clearMyAttachments: () => set({ myAttachments: [] }),

  // #region Existing Attachments
  setExistingAttachmentsForTarget: (targetId, attachments) =>
    set((state) => ({
      existingAttachments: {
        ...state.existingAttachments,
        [targetId]: attachments,
      },
    })),

  addExistingAttachmentToTarget: (targetId, attachment) =>
    set((state) => {
      const existing = state.existingAttachments[targetId] || [];
      return {
        existingAttachments: {
          ...state.existingAttachments,
          [targetId]: [...existing, attachment],
        },
      };
    }),

  removeExistingAttachmentFromTarget: (targetId, attachmentId) =>
    set((state) => {
      const existing = state.existingAttachments[targetId] || [];
      return {
        existingAttachments: {
          ...state.existingAttachments,
          [targetId]: existing.filter((att) => att.id !== attachmentId),
        },
      };
    }),

  clearExistingAttachmentsForTarget: (targetId) =>
    set((state) => {
      const { [targetId]: _, ...rest } = state.existingAttachments;
      return { existingAttachments: rest };
    }),

  upsertExistingAttachmentForTarget: (targetId, attachment) =>
    set((state) => {
      const existing = state.existingAttachments[targetId] || [];
      const index = existing.findIndex((att) => att.id === attachment.id);
      if (index !== -1) {
        existing[index] = attachment;
      } else {
        existing.push(attachment);
      }
      return {
        existingAttachments: {
          ...state.existingAttachments,
          [targetId]: existing,
        },
      };
    }),

  moveExistingAttachmentToDelete: (targetId, attachmentId) => {
    set((state) => {
      const existing = state.existingAttachments[targetId] || [];
      const attachment = existing.find((att) => att.id === attachmentId);

      if (attachment) {
        // Remove from existing attachments
        const updatedExisting = {
          ...state.existingAttachments,
          [targetId]: existing.filter((att) => att.id !== attachmentId),
        };

        // Add to attachments to delete
        const toDelete = state.attachmentsToDelete[targetId] || [];
        return {
          existingAttachments: updatedExisting,
          attachmentsToDelete: {
            ...state.attachmentsToDelete,
            [targetId]: [...toDelete, attachment],
          },
        };
      }

      return state;
    });
  },
  // #endregion Existing Attachments

  // #region Attachments to Upload
  setAttachmentsToUploadForTarget: (targetId, attachments) =>
    set((state) => ({
      attachmentsToUpload: {
        ...state.attachmentsToUpload,
        [targetId]: attachments,
      },
    })),

  addAttachmentToUploadForTarget: (targetId, attachment) =>
    set((state) => {
      const existing = state.attachmentsToUpload[targetId] || [];
      return {
        attachmentsToUpload: {
          ...state.attachmentsToUpload,
          [targetId]: [...existing, attachment],
        },
      };
    }),

  removeAttachmentToUploadForTarget: (targetId, attachmentId) =>
    set((state) => {
      const existing = state.attachmentsToUpload[targetId] || [];
      return {
        attachmentsToUpload: {
          ...state.attachmentsToUpload,
          [targetId]: existing.filter((att) => att.id !== attachmentId),
        },
      };
    }),

  clearAttachmentsToUploadForTarget: (targetId) =>
    set((state) => {
      const { [targetId]: _, ...rest } = state.attachmentsToUpload;
      return { attachmentsToUpload: rest };
    }),

  updateAttachmentToUploadForTarget: (targetId, attachmentId, updates) =>
    set((state) => {
      const existing = state.attachmentsToUpload[targetId] || [];
      return {
        attachmentsToUpload: {
          ...state.attachmentsToUpload,
          [targetId]: existing.map((att) =>
            att.id === attachmentId ? { ...att, ...updates } : att
          ),
        },
      };
    }),

  clearFailedAttachmentsToUploadForTarget: (targetId) =>
    set((state) => {
      const existing = state.attachmentsToUpload[targetId] || [];
      return {
        attachmentsToUpload: {
          ...state.attachmentsToUpload,
          [targetId]: existing.filter((att) => att.status !== "failed"),
        },
      };
    }),
  // #endregion Attachments to Upload

  // #region Current New Target Uploads
  addCurrentNewTargetUpload: (attachment) =>
    set((state) => ({
      currentNewTargetUploads: [...state.currentNewTargetUploads, attachment],
    })),
  removeCurrentNewTargetUpload: (attachmentId) =>
    set((state) => ({
      currentNewTargetUploads: state.currentNewTargetUploads.filter(
        (att) => att.id !== attachmentId
      ),
    })),
  updateCurrentNewTargetUpload: (attachmentId, updates) =>
    set((state) => ({
      currentNewTargetUploads: state.currentNewTargetUploads.map((att) =>
        att.id === attachmentId ? { ...att, ...updates } : att
      ),
    })),
  clearCurrentNewTargetUploads: () => set({ currentNewTargetUploads: [] }),
  moveCurrentNewTargetUploadsToTarget: (targetId) => {
    const state = get();
    const uploads = state.currentNewTargetUploads;
    uploads.forEach((att) => {
      get().addAttachmentToUploadForTarget(targetId, att);
    });
    get().clearCurrentNewTargetUploads();
  },
  // #endregion Current New Target Uploads

  // #region Attachments to Delete
  deleteAttachmentFromExistingAttachments: (targetId, attachmentId) => {
    get().moveExistingAttachmentToDelete(targetId, attachmentId);
  },

  restoreAttachmentFromExistingAttachments: (targetId, attachmentId) => {
    const state = get();
    const toDelete = state.attachmentsToDelete[targetId] || [];
    const attachment = toDelete.find((att) => att.id === attachmentId);

    if (attachment) {
      set((state) => {
        // Remove from attachments to delete
        const updatedToDelete = {
          ...state.attachmentsToDelete,
          [targetId]: toDelete.filter((att) => att.id !== attachmentId),
        };

        // Add back to existing attachments
        const existing = state.existingAttachments[targetId] || [];
        return {
          attachmentsToDelete: updatedToDelete,
          existingAttachments: {
            ...state.existingAttachments,
            [targetId]: [...existing, attachment],
          },
        };
      });
    }
  },

  clearAttachmentsToDelete: (targetId) =>
    set((state) => {
      const { [targetId]: _, ...rest } = state.attachmentsToDelete;
      return { attachmentsToDelete: rest };
    }),
  confirmExistingAttachmentsDeletionForTarget: (targetId) => {
    const state = get();
    const toDelete = state.attachmentsToDelete[targetId] || [];
    toDelete.forEach((att) => {
      get().removeExistingAttachmentFromTarget(targetId, att.id);
    });
    // After a successful save, committed deletions should no longer be
    // tracked as "marked for deletion" for this target.
    get().clearAttachmentsToDelete(targetId);
  },
  // #endregion Attachments to Delete

  // #region Selected Form My Attachments
  selectFormMyAttachmentForTarget: (targetId, attachmentId) =>
    set((state) => {
      const myAttachments = state.myAttachments;
      const attachment = myAttachments.find((att) => att.id === attachmentId);

      if (attachment) {
        const selected = state.selectedFormMyAttachments[targetId] || [];
        const isAlreadySelected = selected.some(
          (att) => att.id === attachmentId
        );

        if (!isAlreadySelected) {
          return {
            selectedFormMyAttachments: {
              ...state.selectedFormMyAttachments,
              [targetId]: [...selected, attachment],
            },
          };
        }
      }

      return state;
    }),

  deselectFormMyAttachmentForTarget: (targetId, attachmentId) =>
    set((state) => {
      const selected = state.selectedFormMyAttachments[targetId] || [];
      return {
        selectedFormMyAttachments: {
          ...state.selectedFormMyAttachments,
          [targetId]: selected.filter((att) => att.id !== attachmentId),
        },
      };
    }),

  toggleFormMyAttachmentSelectionForTarget: (targetId, attachmentId) => {
    const state = get();
    const selected = state.selectedFormMyAttachments[targetId] || [];
    const isSelected = selected.some((att) => att.id === attachmentId);

    if (isSelected) {
      get().deselectFormMyAttachmentForTarget(targetId, attachmentId);
    } else {
      get().selectFormMyAttachmentForTarget(targetId, attachmentId);
    }
  },

  moveSelectedFormMyAttachmentsToExisting: (targetId) => {
    const state = get();
    const selected = state.selectedFormMyAttachments[targetId] || [];
    selected.forEach((att) => {
      get().addExistingAttachmentToTarget(targetId, att);
    });
    get().clearSelectedAttachmentsForTarget(targetId);
  },

  clearSelectedAttachmentsForTarget: (targetId) =>
    set((state) => {
      const { [targetId]: _, ...rest } = state.selectedFormMyAttachments;
      return { selectedFormMyAttachments: rest };
    }),
  // #endregion Selected Form My Attachments

  // #region Current New Target Selections
  selectCurrentNewTargetAttachment: (attachmentId) =>
    set((state) => {
      const attachment = state.myAttachments.find(
        (att) => att.id === attachmentId
      );
      if (attachment) {
        return {
          currentNewTargetSelections: [
            ...state.currentNewTargetSelections,
            attachment,
          ],
        };
      }
      return state;
    }),
  deselectCurrentNewTargetAttachment: (attachmentId) =>
    set((state) => ({
      currentNewTargetSelections: state.currentNewTargetSelections.filter(
        (att) => att.id !== attachmentId
      ),
    })),
  // #endregion Current New Target Selections
  toggleCurrentNewTargetAttachmentSelection: (attachmentId) => {
    const state = get();
    const isSelected = state.currentNewTargetSelections.some(
      (att) => att.id === attachmentId
    );
    if (isSelected) {
      get().deselectCurrentNewTargetAttachment(attachmentId);
    } else {
      get().selectCurrentNewTargetAttachment(attachmentId);
    }
  },
  clearCurrentNewTargetSelections: () =>
    set({ currentNewTargetSelections: [] }),
  moveCurrentNewTargetSelectionsToExisting: (targetId) => {
    const state = get();
    const selected = state.currentNewTargetSelections;
    selected.forEach((att) => {
      get().addExistingAttachmentToTarget(targetId, att);
    });
    get().clearCurrentNewTargetSelections();
  },
  moveCurrentNewTargetSelectionsToTarget: (targetId) => {
    const state = get();
    const selected = state.currentNewTargetSelections;
    selected.forEach((att) => {
      get().selectFormMyAttachmentForTarget(targetId, att.id);
    });
    get().clearCurrentNewTargetSelections();
  },
}));
