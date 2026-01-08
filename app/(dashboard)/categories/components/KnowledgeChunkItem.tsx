"use client";

import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import KnowledgeChunkActions from "./KnowledgeChunkActions";

interface KnowledgeChunkItemProps {
    chunk: KnowledgeChunk;
    categoryId: string;
}

export default function KnowledgeChunkItem({ chunk, categoryId }: KnowledgeChunkItemProps) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
            <p className="text-sm text-slate-700 line-clamp-2 flex-1 mr-4">
                {chunk.content}
            </p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <KnowledgeChunkActions chunk={chunk} categoryId={categoryId} />
            </div>
        </div>
    );
}
