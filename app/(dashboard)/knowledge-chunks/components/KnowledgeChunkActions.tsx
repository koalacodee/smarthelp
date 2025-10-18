"use client";
import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";
import { useKnowledgeChunksStore } from "../store/useKnowledgeChunksStore";
import { KnowledgeChunksService } from "@/lib/api";
import { useKnowledgeChunkModalStore } from "../store/useKnowledgeChunkModalStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";

interface KnowledgeChunkActionsProps {
  chunkId: string;
  departmentId: string;
}

export default function KnowledgeChunkActions({
  chunkId,
  departmentId,
}: KnowledgeChunkActionsProps) {
  const { removeChunk } = useKnowledgeChunksStore();
  const { openEditModal } = useKnowledgeChunkModalStore();
  const { openModal } = useConfirmationModalStore();

  const handleDelete = async () => {
    try {
      await KnowledgeChunksService.deleteKnowledgeChunk(chunkId);
      removeChunk(departmentId, chunkId);
      useToastStore
        .getState()
        .addToast({
          message: "Knowledge chunk deleted successfully",
          type: "success",
        });
    } catch (error) {
      useToastStore
        .getState()
        .addToast({
          message: "Failed to delete knowledge chunk",
          type: "error",
        });
    }
  };

  const confirmDelete = () => {
    openModal({
      title: "Delete Knowledge Chunk",
      message:
        "Are you sure you want to delete this knowledge chunk? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: handleDelete,
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => openEditModal(chunkId)}
        className="text-primary hover:text-primary/80 transition-colors"
        title="Edit knowledge chunk"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={confirmDelete}
        className="text-destructive hover:text-destructive/80 transition-colors"
        title="Delete knowledge chunk"
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
}
