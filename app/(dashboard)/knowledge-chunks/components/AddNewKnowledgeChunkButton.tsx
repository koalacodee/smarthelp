"use client";
import Plus from "@/icons/Plus";
import { useKnowledgeChunkModalStore } from "../store/useKnowledgeChunkModalStore";

export default function AddNewKnowledgeChunkButton() {
  const { openAddModal } = useKnowledgeChunkModalStore();

  return (
    <button
      onClick={openAddModal}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
    >
      <Plus className="-ml-1 mr-2 h-5 w-5" />
      Add Knowledge Chunk
    </button>
  );
}
