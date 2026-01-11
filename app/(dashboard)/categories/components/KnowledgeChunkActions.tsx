"use client";

import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import { KnowledgeChunksService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";

interface KnowledgeChunkActionsProps {
  chunk: KnowledgeChunk;
  categoryId: string;
}

export default function KnowledgeChunkActions({
  chunk,
  categoryId,
}: KnowledgeChunkActionsProps) {
  const { openModal, removeKnowledgeChunk } = useCategoriesStore();
  const { openModal: openConfirmation } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { locale } = useLocaleStore();

  const handleEdit = () => {
    openModal("knowledgeChunk", "edit", chunk, categoryId);
  };

  const handleDelete = () => {
    openConfirmation({
      title:
        locale?.categories?.confirmations?.deleteKnowledgeChunkTitle ||
        "Delete Knowledge Chunk",
      message:
        locale?.categories?.confirmations?.deleteKnowledgeChunkMessage ||
        "Are you sure you want to delete this knowledge chunk?",
      onConfirm: async () => {
        try {
          await KnowledgeChunksService.deleteKnowledgeChunk(chunk.id);
          removeKnowledgeChunk(categoryId, chunk.id);
          addToast({
            message:
              locale?.categories?.toasts?.knowledgeChunkDeleted ||
              "Knowledge chunk deleted",
            type: "success",
          });
        } catch {
          addToast({
            message: locale?.categories?.toasts?.deleteError || "Delete error",
            type: "error",
          });
        }
      },
    });
  };

  if (!locale) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleEdit}
        className="p-1.5 rounded hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
        title={locale.categories.actions.edit}
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 rounded hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
        title={locale.categories.actions.delete}
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  );
}
