"use client";
import { create } from "zustand";

export interface Attachment {
  file: File;
  expirationDate: Date;
}

export interface ExistingAttachment {
  fileType: string;
  originalName: string;
  sizeInBytes: number;
  expiryDate: string;
  contentType: string;
}

interface AttachmentStore {
  attachments: Attachment[];
  existingAttachments: { [attachmentId: string]: ExistingAttachment };
  existingsToDelete: { [attachmentId: string]: ExistingAttachment };
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  setExistingAttachments: (attachments: {
    [attachmentId: string]: ExistingAttachment;
  }) => void;
  addExistingAttachment: (
    attachmentId: string,
    attachment: ExistingAttachment
  ) => void;
  deleteExistingAttachment: (attachmentId: string) => void;
  restoreExistingAttachment: (attachmentId: string) => void;
  clearExistingsToDelete: () => void;
  clearExistingAttachments: () => void;
  getAttachment: (index: number) => Attachment | undefined;
  getFormData: () => FormData;
}

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  attachments: [],
  existingAttachments: {},
  existingsToDelete: {},

  addAttachment: (attachment) => {
    set((state) => ({
      attachments: [...state.attachments, attachment],
    }));
  },

  removeAttachment: (index) => {
    set((state) => ({
      attachments: state.attachments.filter((_, i) => i !== index),
    }));
  },

  clearAttachments: () => {
    set({ attachments: [] });
  },

  setExistingAttachments: (attachments) => {
    set({ existingAttachments: attachments });
  },

  addExistingAttachment: (attachmentId, attachment) => {
    set((state) => ({
      existingAttachments: {
        ...state.existingAttachments,
        [attachmentId]: attachment,
      },
    }));
  },

  deleteExistingAttachment: (attachmentId) => {
    set((state) => {
      const attachmentToDelete = state.existingAttachments[attachmentId];
      if (!attachmentToDelete) return state;

      const { [attachmentId]: removed, ...remaining } =
        state.existingAttachments;
      return {
        existingAttachments: remaining,
        existingsToDelete: {
          ...state.existingsToDelete,
          [attachmentId]: attachmentToDelete,
        },
      };
    });
  },

  restoreExistingAttachment: (attachmentId) => {
    set((state) => {
      const attachmentToRestore = state.existingsToDelete[attachmentId];
      if (!attachmentToRestore) return state;

      const { [attachmentId]: removed, ...remaining } = state.existingsToDelete;
      return {
        existingAttachments: {
          ...state.existingAttachments,
          [attachmentId]: attachmentToRestore,
        },
        existingsToDelete: remaining,
      };
    });
  },

  clearExistingsToDelete: () => {
    set({ existingsToDelete: {} });
  },

  clearExistingAttachments: () => {
    set({ existingAttachments: {} });
  },

  getAttachment: (index) => {
    return get().attachments[index];
  },

  getFormData: () => {
    const { attachments, existingsToDelete } = get();
    const formData = new FormData();

    // Add new files
    if (attachments.length > 0) {
      if (attachments.length === 1) {
        // Single attachment - use 'file' field
        formData.append("file", attachments[0].file);
      } else {
        // Multiple attachments - use 'files' field multiple times
        attachments.forEach((attachment) => {
          formData.append("files", attachment.file);
        });
      }

      // Add expiration dates for new files
      if (attachments.length === 1) {
        // Single attachment - add as single expiration date
        formData.append(
          "expirationDate",
          attachments[0].expirationDate.toISOString()
        );
      } else {
        // Multiple attachments - add as indexed expiration dates
        attachments.forEach((attachment, index) => {
          formData.append(
            `expirationDates[${index}]`,
            attachment.expirationDate.toISOString()
          );
        });
      }
    }

    // Add information about deleted existing attachments
    if (Object.keys(existingsToDelete).length > 0) {
      formData.append(
        "deletedExistingAttachments",
        JSON.stringify(Object.values(existingsToDelete))
      );
    }

    return formData;
  },
}));
