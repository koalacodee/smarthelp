import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import { create } from "zustand";

export interface KnowledgeChunkStore {
  knowledgeChunks: Record<string, KnowledgeChunk[]>;
  addKnowledgeChunk(departmentId: string, knowledgeChunk: KnowledgeChunk): void;
  removeKnowledgeChunk(departmentId: string, knowledgeChunkId: string): void;
  updateKnowledgeChunk(
    departmentId: string,
    knowledgeChunk: KnowledgeChunk
  ): void;
  clearKnowledgeChunks(): void;
  clearKnowledgeChunksByDepartment(departmentId: string): void;
  setKnowledgeChunksForDepartment(
    departmentId: string,
    knowledgeChunks: KnowledgeChunk[]
  ): void;
  setKnowledgeChunks(knowledgeChunks: Record<string, KnowledgeChunk[]>): void;
}

export const useKnowledgeChunkStore = create<KnowledgeChunkStore>(
  (set, get) => {
    return {
      knowledgeChunks: {},
      addKnowledgeChunk(departmentId: string, knowledgeChunk: KnowledgeChunk) {
        set((state) => ({
          knowledgeChunks: {
            ...state.knowledgeChunks,
            [departmentId]: [
              ...(state.knowledgeChunks[departmentId] || []),
              knowledgeChunk,
            ],
          },
        }));
      },
      removeKnowledgeChunk(departmentId: string, knowledgeChunkId: string) {
        set((state) => ({
          knowledgeChunks: {
            ...state.knowledgeChunks,
            [departmentId]: state.knowledgeChunks[departmentId].filter(
              (chunk) => chunk.id !== knowledgeChunkId
            ),
          },
        }));
      },
      updateKnowledgeChunk(
        departmentId: string,
        knowledgeChunk: KnowledgeChunk
      ) {
        set((state) => ({
          knowledgeChunks: {
            ...state.knowledgeChunks,
            [departmentId]: state.knowledgeChunks[departmentId].map((chunk) =>
              chunk.id === knowledgeChunk.id ? knowledgeChunk : chunk
            ),
          },
        }));
      },
      clearKnowledgeChunks() {
        set({ knowledgeChunks: {} });
      },
      clearKnowledgeChunksByDepartment(departmentId: string) {
        set((state) => ({
          knowledgeChunks: {
            ...state.knowledgeChunks,
            [departmentId]: [],
          },
        }));
      },
      setKnowledgeChunksForDepartment(
        departmentId: string,
        knowledgeChunks: KnowledgeChunk[]
      ) {
        set((state) => ({
          knowledgeChunks: {
            ...state.knowledgeChunks,
            [departmentId]: knowledgeChunks,
          },
        }));
      },

      setKnowledgeChunks(knowledgeChunks: Record<string, KnowledgeChunk[]>) {
        set({ knowledgeChunks });
      },
    };
  }
);
