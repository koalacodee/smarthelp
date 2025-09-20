"use client";

import { create } from "zustand";

// Type for attachment metadata from the API
export interface AttachmentMetadata {
  fileType: string;
  originalName: string;
  sizeInBytes: number;
  expiryDate: string;
  contentType: string;
}

// Store state interface
interface MediaMetadataState {
  // Store metadata by attachmentId (token)
  metadata: {
    [attachmentId: string]: AttachmentMetadata;
  };

  // Loading states
  isLoading: boolean;
  isFetching: boolean;

  // Error handling
  error: string | null;

  // Core methods
  setMetadata: (attachmentId: string, metadata: AttachmentMetadata) => void;
  setMultipleMetadata: (metadataMap: {
    [attachmentId: string]: AttachmentMetadata;
  }) => void;
  getMetadata: (attachmentId: string) => AttachmentMetadata | undefined;
  hasMetadata: (attachmentId: string) => boolean;
  clearMetadata: (attachmentId?: string) => void;

  // State management methods
  setLoading: (loading: boolean) => void;
  setFetching: (fetching: boolean) => void;
  setError: (error: string | null) => void;

  // Batch operations
  fetchMetadataForAttachments: (attachmentIds: string[]) => Promise<void>;
  fetchMetadataForType: (
    type: string,
    attachmentIds: string[]
  ) => Promise<void>;
}

export const useMediaMetadataStore = create<MediaMetadataState>((set, get) => ({
  metadata: {},
  isLoading: false,
  isFetching: false,
  error: null,

  // Set metadata for a single attachment
  setMetadata: (attachmentId, metadata) =>
    set((state) => ({
      metadata: {
        ...state.metadata,
        [attachmentId]: metadata,
      },
    })),

  // Set metadata for multiple attachments
  setMultipleMetadata: (metadataMap) =>
    set((state) => ({
      metadata: {
        ...state.metadata,
        ...metadataMap,
      },
    })),

  // Get metadata for a specific attachment
  getMetadata: (attachmentId) => {
    const state = get();
    return state.metadata[attachmentId];
  },

  // Check if metadata exists for an attachment
  hasMetadata: (attachmentId) => {
    const state = get();
    return attachmentId in state.metadata;
  },

  // Clear metadata for a specific attachment or all
  clearMetadata: (attachmentId) =>
    set((state) => {
      if (attachmentId) {
        const { [attachmentId]: removed, ...remaining } = state.metadata;
        return {
          metadata: remaining,
        };
      }
      return {
        metadata: {},
      };
    }),

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Set fetching state
  setFetching: (fetching) => set({ isFetching: fetching }),

  // Set error state
  setError: (error) => set({ error }),

  // Fetch metadata for multiple attachments
  fetchMetadataForAttachments: async (attachmentIds) => {
    const { setFetching, setError, setMultipleMetadata } = get();

    if (attachmentIds.length === 0) return;

    setFetching(true);
    setError(null);

    try {
      // Import the FileService dynamically to avoid circular dependencies
      const { FileService } = await import("@/lib/api");

      // Fetch metadata for all attachments in parallel
      const metadataPromises = attachmentIds.map(async (attachmentId) => {
        try {
          const metadata = await FileService.getAttachmentMetadata(
            attachmentId
          );
          return { attachmentId, metadata };
        } catch (error) {
          console.error(`Failed to fetch metadata for ${attachmentId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(metadataPromises);

      // Filter out failed requests and create metadata map
      const metadataMap = results
        .filter(
          (
            result
          ): result is { attachmentId: string; metadata: AttachmentMetadata } =>
            result !== null
        )
        .reduce((acc, { attachmentId, metadata }) => {
          acc[attachmentId] = metadata;
          return acc;
        }, {} as { [attachmentId: string]: AttachmentMetadata });

      setMultipleMetadata(metadataMap);
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
      setError("Failed to fetch attachment metadata");
    } finally {
      setFetching(false);
    }
  },

  // Fetch metadata for attachments of a specific type
  fetchMetadataForType: async (type, attachmentIds) => {
    const { fetchMetadataForAttachments } = get();
    await fetchMetadataForAttachments(attachmentIds);
  },
}));

// Type-safe helper functions for specific attachment types
export const useFAQMediaMetadata = () => {
  const store = useMediaMetadataStore();
  return {
    ...store,
    fetchFAQMetadata: (attachmentIds: string[]) =>
      store.fetchMetadataForType("faq", attachmentIds),
  };
};

export const useTaskMediaMetadata = () => {
  const store = useMediaMetadataStore();
  return {
    ...store,
    fetchTaskMetadata: (attachmentIds: string[]) =>
      store.fetchMetadataForType("task", attachmentIds),
  };
};

export const useTicketMediaMetadata = () => {
  const store = useMediaMetadataStore();
  return {
    ...store,
    fetchTicketMetadata: (attachmentIds: string[]) =>
      store.fetchMetadataForType("ticket", attachmentIds),
  };
};

export const usePromotionMediaMetadata = () => {
  const store = useMediaMetadataStore();
  return {
    ...store,
    fetchPromotionMetadata: (attachmentIds: string[]) =>
      store.fetchMetadataForType("promotion", attachmentIds),
  };
};
