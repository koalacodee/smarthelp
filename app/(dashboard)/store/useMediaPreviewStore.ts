"use client";
import { create } from "zustand";

export interface MediaPreviewInfo {
  originalName: string;
  tokenOrId: string;
  fileType?: string;
  sizeInBytes?: number;
  expiryDate?: string;
}

interface MediaPreviewStore {
  isOpen: boolean;
  mediaInfo: MediaPreviewInfo | null;

  // Actions
  openPreview: (mediaInfo: MediaPreviewInfo) => void;
  closePreview: () => void;
}

export const useMediaPreviewStore = create<MediaPreviewStore>((set) => ({
  isOpen: false,
  mediaInfo: null,

  openPreview: (mediaInfo) => set({ isOpen: true, mediaInfo }),
  closePreview: () => set({ isOpen: false, mediaInfo: null }),
}));
