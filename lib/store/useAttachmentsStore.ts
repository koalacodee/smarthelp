"use client";

import { create } from "zustand";

// Generic type for different attachment response types
type AttachmentResponse = {
  attachments: { [key: string]: string[] };
};

// Store state interface
interface AttachmentsState {
  // Store attachments by type (e.g., 'faq', 'task', 'promotion')
  attachments: {
    [type: string]: { [id: string]: string[] | undefined };
  };

  // Loading states for different operations
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error handling
  error: string | null;

  // Core methods
  setAttachments: (
    type: string,
    attachments: { [id: string]: string[] }
  ) => void;
  addAttachments: (type: string, id: string, attachmentUrls: string[]) => void;
  removeAttachments: (
    type: string,
    id: string,
    attachmentUrls?: string[]
  ) => void;
  clearAttachments: (type?: string) => void;

  // Utility methods
  getAttachments: (type: string, id: string) => string[];
  hasAttachments: (type: string, id: string) => boolean;

  // State management methods
  setLoading: (loading: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setError: (error: string | null) => void;

  // Bulk operations
  setAttachmentsFromResponse: <T extends AttachmentResponse>(
    type: string,
    response: T
  ) => void;
  mergeAttachments: (
    type: string,
    newAttachments: { [id: string]: string[] }
  ) => void;
}

export const useAttachmentsStore = create<AttachmentsState>((set, get) => ({
  attachments: {},
  isLoading: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // Set attachments for a specific type, replacing existing ones
  setAttachments: (type, attachments) =>
    set((state) => ({
      attachments: {
        ...state.attachments,
        [type]: attachments,
      },
    })),

  // Add attachments for a specific item
  addAttachments: (type, id, attachmentUrls) =>
    set((state) => {
      const currentAttachments = state.attachments[type] || {};
      const existingUrls = currentAttachments[id] || [];
      const newUrls = [...new Set([...existingUrls, ...attachmentUrls])]; // Remove duplicates

      return {
        attachments: {
          ...state.attachments,
          [type]: {
            ...currentAttachments,
            [id]: newUrls,
          },
        },
      };
    }),

  // Remove attachments for a specific item
  removeAttachments: (type, id, attachmentUrls) =>
    set((state) => {
      const currentAttachments = state.attachments[type] || {};
      const existingUrls = currentAttachments[id] || [];

      if (!attachmentUrls) {
        // Remove all attachments for this item
        const { [id]: removed, ...remaining } = currentAttachments;
        return {
          attachments: {
            ...state.attachments,
            [type]: remaining,
          },
        };
      }

      // Remove specific attachment URLs
      const filteredUrls = existingUrls.filter(
        (url) => !attachmentUrls.includes(url)
      );

      return {
        attachments: {
          ...state.attachments,
          [type]: {
            ...currentAttachments,
            [id]: filteredUrls.length > 0 ? filteredUrls : undefined,
          },
        },
      };
    }),

  // Clear attachments for a specific type or all types
  clearAttachments: (type) =>
    set((state) => {
      if (type) {
        const { [type]: removed, ...remaining } = state.attachments;
        return {
          attachments: remaining,
        };
      }
      return {
        attachments: {},
      };
    }),

  // Get attachments for a specific item
  getAttachments: (type, id) => {
    const state = get();
    return state.attachments[type]?.[id] || [];
  },

  // Check if an item has attachments
  hasAttachments: (type, id) => {
    const state = get();
    const attachments = state.attachments[type]?.[id];
    return Boolean(attachments && attachments.length > 0);
  },

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Set updating state
  setUpdating: (updating) => set({ isUpdating: updating }),

  // Set deleting state
  setDeleting: (deleting) => set({ isDeleting: deleting }),

  // Set error state
  setError: (error) => set({ error }),

  // Set attachments from API response
  setAttachmentsFromResponse: (type, response) =>
    set((state) => ({
      attachments: {
        ...state.attachments,
        [type]: response.attachments,
      },
    })),

  // Merge new attachments with existing ones
  mergeAttachments: (type, newAttachments) =>
    set((state) => {
      const currentAttachments = state.attachments[type] || {};
      const mergedAttachments = { ...currentAttachments };

      Object.entries(newAttachments).forEach(([id, urls]) => {
        const existingUrls = mergedAttachments[id] || [];
        mergedAttachments[id] = [...new Set([...existingUrls, ...urls])];
      });

      return {
        attachments: {
          ...state.attachments,
          [type]: mergedAttachments,
        },
      };
    }),
}));

// Type-safe helper functions for specific attachment types
export const useFAQAttachments = () => {
  const store = useAttachmentsStore();
  return {
    ...store,
    setFAQAttachments: (attachments: { [questionId: string]: string[] }) =>
      store.setAttachments("faq", attachments),
    addFAQAttachments: (questionId: string, urls: string[]) =>
      store.addAttachments("faq", questionId, urls),
    removeFAQAttachments: (questionId: string, urls?: string[]) =>
      store.removeAttachments("faq", questionId, urls),
    getFAQAttachments: (questionId: string) =>
      store.getAttachments("faq", questionId),
    hasFAQAttachments: (questionId: string) =>
      store.hasAttachments("faq", questionId),
  };
};

export const useTaskAttachments = () => {
  const store = useAttachmentsStore();
  return {
    ...store,
    setTaskAttachments: (attachments: { [taskId: string]: string[] }) =>
      store.setAttachments("task", attachments),
    addTaskAttachments: (taskId: string, urls: string[]) =>
      store.addAttachments("task", taskId, urls),
    removeTaskAttachments: (taskId: string, urls?: string[]) =>
      store.removeAttachments("task", taskId, urls),
    getTaskAttachments: (taskId: string) =>
      store.getAttachments("task", taskId),
    hasTaskAttachments: (taskId: string) =>
      store.hasAttachments("task", taskId),
  };
};

export const usePromotionAttachments = () => {
  const store = useAttachmentsStore();
  return {
    ...store,
    setPromotionAttachments: (attachments: {
      [promotionId: string]: string[];
    }) => store.setAttachments("promotion", attachments),
    addPromotionAttachments: (promotionId: string, urls: string[]) =>
      store.addAttachments("promotion", promotionId, urls),
    removePromotionAttachments: (promotionId: string, urls?: string[]) =>
      store.removeAttachments("promotion", promotionId, urls),
    getPromotionAttachments: (promotionId: string) =>
      store.getAttachments("promotion", promotionId),
    hasPromotionAttachments: (promotionId: string) =>
      store.hasAttachments("promotion", promotionId),
  };
};
