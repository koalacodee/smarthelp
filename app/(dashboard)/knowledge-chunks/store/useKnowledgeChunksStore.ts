import { GetAllKnowledgeChunks200ResponseDataInner as KnowledgeChunk } from "@/lib/api/sdk/models";
import { create } from "zustand";
import { GroupedKnowledgeChunks } from "../page";

interface KnowledgeChunksState {
  chunks: GroupedKnowledgeChunks[];
  setChunks: (chunks: GroupedKnowledgeChunks[]) => void;
  addChunk: (departmentId: string, chunk: KnowledgeChunk) => void;
  updateChunk: (
    departmentId: string,
    chunkId: string,
    updated: Partial<KnowledgeChunk>
  ) => void;
  removeChunk: (departmentId: string, chunkId: string) => void;
}

export const useKnowledgeChunksStore = create<KnowledgeChunksState>((set) => ({
  chunks: [],

  setChunks: (chunks) => set({ chunks }),

  addChunk: (departmentId, chunk) =>
    set((state) => ({
      chunks: state.chunks.map((group) =>
        group.departmentId === departmentId
          ? { ...group, chunks: [...group.chunks, chunk] }
          : group
      ),
    })),

  updateChunk: (departmentId, chunkId, updated) =>
    set((state) => ({
      chunks: state.chunks.map((group) =>
        group.departmentId === departmentId
          ? {
              ...group,
              chunks: group.chunks.map((c) =>
                c.id === chunkId ? { ...c, ...updated } : c
              ),
            }
          : group
      ),
    })),

  removeChunk: (departmentId, chunkId) =>
    set((state) => ({
      chunks: state.chunks.map((group) =>
        group.departmentId === departmentId
          ? {
              ...group,
              chunks: group.chunks.filter((c) => c.id !== chunkId),
            }
          : group
      ),
    })),
}));
