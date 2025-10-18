"use client";
import { create } from "zustand";
import { Attachment as ApiAttachment } from "@/lib/api/v2/services/shared/upload";

export interface Attachment {
  file: File;
  expirationDate?: Date; // Made optional
}

export interface ExistingAttachment {
  fileType: string;
  originalName: string;
  sizeInBytes: number;
  expiryDate?: string; // Made optional
  contentType: string;
}

interface AttachmentStore {
  attachments: Attachment[];
  existingAttachments: { [attachmentId: string]: ExistingAttachment };
  existingsToDelete: { [attachmentId: string]: ExistingAttachment };
  // New state for "Choose From My Files" feature
  myAttachments: ApiAttachment[];
  selectedAttachmentIds: Set<string>;
  selectedAttachments: { [attachmentId: string]: ExistingAttachment };
  isLoadingMyAttachments: boolean;
  myAttachmentsError: string | null;

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
  clearAll: () => void;

  // New methods for "Choose From My Files" feature
  fetchMyAttachments: () => Promise<void>;
  selectAttachment: (attachmentId: string) => void;
  deselectAttachment: (attachmentId: string) => void;
  toggleAttachmentSelection: (attachmentId: string) => void;
  clearSelectedAttachments: () => void;
  addSelectedAttachmentsToExisting: () => void;
  moveSelectedToExisting: (attachmentId: string) => void;
  removeSelectedAttachment: (attachmentId: string) => void;
  moveAllSelectedToExisting: () => void;
}

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  attachments: [],
  existingAttachments: {},
  existingsToDelete: {},
  // New state for "Choose From My Files" feature
  myAttachments: [],
  selectedAttachmentIds: new Set<string>(),
  selectedAttachments: {},
  isLoadingMyAttachments: false,
  myAttachmentsError: null,

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

    console.log("getFormData - attachments:", attachments);
    console.log("getFormData - attachments.length:", attachments.length);
    console.log("getFormData - existingsToDelete:", existingsToDelete);

    // Add new files
    if (attachments.length > 0) {
      console.log("Adding attachments to FormData");
      if (attachments.length === 1) {
        // Single attachment - use 'file' field
        console.log("Adding single file:", attachments[0].file);
        formData.append("file", attachments[0].file);
      } else {
        // Multiple attachments - use 'files' field multiple times
        attachments.forEach((attachment, index) => {
          console.log(`Adding file ${index}:`, attachment.file);
          formData.append("files", attachment.file);
        });
      }

      // Add expiration dates for new files (only if they exist)
      if (attachments.length === 1) {
        // Single attachment - add as single expiration date if it exists
        if (attachments[0].expirationDate) {
          formData.append(
            "expirationDate",
            attachments[0].expirationDate.toISOString()
          );
        }
      } else {
        // Multiple attachments - add as indexed expiration dates if they exist
        attachments.forEach((attachment, index) => {
          if (attachment.expirationDate) {
            formData.append(
              `expirationDates[${index}]`,
              attachment.expirationDate.toISOString()
            );
          }
        });
      }
    } else {
      console.log("No attachments found in store");
    }

    // Add information about deleted existing attachments
    if (Object.keys(existingsToDelete).length > 0) {
      formData.append(
        "deletedExistingAttachments",
        JSON.stringify(Object.values(existingsToDelete))
      );
    }

    console.log("getFormData - final FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Additional FormData debugging
    console.log(
      "FormData size check:",
      formData.has("file") || formData.has("files")
    );
    console.log("FormData keys:", Array.from(formData.keys()));
    console.log("FormData values:", Array.from(formData.values()));

    return formData;
  },

  clearAll: () => {
    set({
      attachments: [],
      existingAttachments: {},
      existingsToDelete: {},
      myAttachments: [],
      selectedAttachmentIds: new Set<string>(),
      selectedAttachments: {},
      isLoadingMyAttachments: false,
      myAttachmentsError: null,
    });
  },

  // New methods for "Choose From My Files" feature
  fetchMyAttachments: async () => {
    set({ isLoadingMyAttachments: true, myAttachmentsError: null });
    try {
      const { UploadService } = await import("@/lib/api/v2");
      const response = await UploadService.getMyAttachments();
      set({
        myAttachments: response.attachments,
        isLoadingMyAttachments: false,
      });
    } catch (error) {
      set({
        isLoadingMyAttachments: false,
        myAttachmentsError:
          error instanceof Error ? error.message : "Failed to load attachments",
      });
    }
  },

  selectAttachment: (attachmentId: string) => {
    set((state) => {
      // Find the attachment in myAttachments
      const attachment = state.myAttachments.find((a) => a.id === attachmentId);
      if (!attachment) return state;

      // Add to selectedAttachmentIds and selectedAttachments
      const newSelectedAttachments = {
        ...state.selectedAttachments,
        [attachmentId]: {
          fileType: attachment.fileType,
          originalName: attachment.originalName,
          sizeInBytes: attachment.size,
          expiryDate: attachment.expirationDate || undefined,
          contentType: attachment.contentType,
        },
      };

      return {
        selectedAttachmentIds: new Set([
          ...state.selectedAttachmentIds,
          attachmentId,
        ]),
        selectedAttachments: newSelectedAttachments,
      };
    });
  },

  deselectAttachment: (attachmentId: string) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedAttachmentIds);
      newSelectedIds.delete(attachmentId);

      // Remove from selectedAttachments
      const { [attachmentId]: removed, ...remainingSelectedAttachments } =
        state.selectedAttachments;

      return {
        selectedAttachmentIds: newSelectedIds,
        selectedAttachments: remainingSelectedAttachments,
      };
    });
  },

  toggleAttachmentSelection: (attachmentId: string) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedAttachmentIds);

      if (newSelectedIds.has(attachmentId)) {
        newSelectedIds.delete(attachmentId);
      } else {
        newSelectedIds.add(attachmentId);
      }

      return { selectedAttachmentIds: newSelectedIds };
    });
  },

  clearSelectedAttachments: () => {
    set({
      selectedAttachmentIds: new Set<string>(),
      selectedAttachments: {},
    });
  },

  addSelectedAttachmentsToExisting: () => {
    const { myAttachments, selectedAttachmentIds } = get();

    // Convert selected attachment IDs to ExistingAttachment format
    const selectedAttachments: {
      [attachmentId: string]: ExistingAttachment;
    } = {};

    myAttachments.forEach((attachment) => {
      if (selectedAttachmentIds.has(attachment.id)) {
        selectedAttachments[attachment.id] = {
          fileType: attachment.fileType,
          originalName: attachment.originalName,
          sizeInBytes: attachment.size,
          expiryDate: attachment.expirationDate || undefined,
          contentType: attachment.contentType,
        };
      }
    });

    set((state) => ({
      selectedAttachments,
      // Don't clear the selectedAttachmentIds so the checkboxes stay checked
    }));
  },

  moveSelectedToExisting: (attachmentId: string) => {
    set((state) => {
      const attachment = state.selectedAttachments[attachmentId];
      if (!attachment) return state;

      // Remove from selected
      const newSelectedIds = new Set(state.selectedAttachmentIds);
      newSelectedIds.delete(attachmentId);

      const { [attachmentId]: removed, ...remainingSelectedAttachments } =
        state.selectedAttachments;

      // Add to existing
      return {
        selectedAttachmentIds: newSelectedIds,
        selectedAttachments: remainingSelectedAttachments,
        existingAttachments: {
          ...state.existingAttachments,
          [attachmentId]: attachment,
        },
      };
    });
  },

  moveAllSelectedToExisting: () => {
    set((state) => {
      // If no selected attachments, do nothing
      if (Object.keys(state.selectedAttachments).length === 0) {
        return state;
      }

      // Move all selected attachments to existing
      return {
        selectedAttachmentIds: new Set<string>(),
        selectedAttachments: {},
        existingAttachments: {
          ...state.existingAttachments,
          ...state.selectedAttachments,
        },
      };
    });
  },

  removeSelectedAttachment: (attachmentId: string) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedAttachmentIds);
      newSelectedIds.delete(attachmentId);

      const { [attachmentId]: removed, ...remainingSelectedAttachments } =
        state.selectedAttachments;

      return {
        selectedAttachmentIds: newSelectedIds,
        selectedAttachments: remainingSelectedAttachments,
      };
    });
  },
}));
