import { create } from "zustand";
import { GetAllKnowledgeChunks200ResponseDataInner as KnowledgeChunk } from "@/lib/api/sdk/models";

interface KnowledgeChunkModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  chunk: KnowledgeChunk | null;
  openAddModal: () => void;
  openEditModal: (chunkId: string) => void;
  closeModal: () => void;
}

export const useKnowledgeChunkModalStore = create<KnowledgeChunkModalState>((set) => ({
  isOpen: false,
  mode: 'add',
  chunk: null,

  openAddModal: () => set({ isOpen: true, mode: 'add', chunk: null }),

  openEditModal: (chunkId: string) => {
    // The actual chunk data will be loaded in the modal component
    set({ isOpen: true, mode: 'edit', chunk: { id: chunkId } as KnowledgeChunk });
  },

  closeModal: () => set({ isOpen: false, mode: 'add', chunk: null }),
}));
