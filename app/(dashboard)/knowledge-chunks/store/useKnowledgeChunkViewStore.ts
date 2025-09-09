import { GetAllKnowledgeChunks200ResponseDataInner as KnowledgeChunk } from "@/lib/api/sdk/models";
import { create } from "zustand";

interface KnowledgeChunkViewState {
  selectedChunk: KnowledgeChunk | null;
  isWidgetOpen: boolean;
  openWidget: (chunk: KnowledgeChunk) => void;
  closeWidget: () => void;
  toggleWidget: (chunk: KnowledgeChunk) => void;
}

export const useKnowledgeChunkViewStore = create<KnowledgeChunkViewState>((set) => ({
  selectedChunk: null,
  isWidgetOpen: false,

  openWidget: (chunk) => set({ selectedChunk: chunk, isWidgetOpen: true }),
  closeWidget: () => set({ selectedChunk: null, isWidgetOpen: false }),
  toggleWidget: (chunk) => set((state) => ({
    selectedChunk: chunk,
    isWidgetOpen: state.selectedChunk?.id === chunk.id ? !state.isWidgetOpen : true,
  })),
}));
