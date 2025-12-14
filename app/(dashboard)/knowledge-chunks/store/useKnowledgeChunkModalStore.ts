import { create } from "zustand";
import { GetAllKnowledgeChunks200ResponseDataInner as KnowledgeChunk } from "@/lib/api/sdk/models";

interface KnowledgeChunkModalState {
  isOpen: boolean;
  mode: "add" | "edit";
  chunk: KnowledgeChunk | null;
  preSelectedDepartmentId?: string;
  openAddModal: (departmentId?: string) => void;
  openEditModal: (chunkId: string) => void;
  closeModal: () => void;
}

export const useKnowledgeChunkModalStore = create<KnowledgeChunkModalState>(
  (set) => ({
    isOpen: false,
    mode: "add",
    chunk: null,
    preSelectedDepartmentId: undefined,

    openAddModal: (departmentId) =>
      set({
        isOpen: true,
        mode: "add",
        chunk: null,
        preSelectedDepartmentId: departmentId,
      }),

    openEditModal: (chunkId: string) => {
      // The actual chunk data will be loaded in the modal component
      set({
        isOpen: true,
        mode: "edit",
        chunk: { id: chunkId } as KnowledgeChunk,
        preSelectedDepartmentId: undefined,
      });
    },

    closeModal: () =>
      set({
        isOpen: false,
        mode: "add",
        chunk: null,
        preSelectedDepartmentId: undefined,
      }),
  })
);
