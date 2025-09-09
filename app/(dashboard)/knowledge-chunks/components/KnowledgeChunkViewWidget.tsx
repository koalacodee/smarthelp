"use client";
import { useKnowledgeChunkViewStore } from "../store/useKnowledgeChunkViewStore";
import XCircle from "@/icons/XCircle";

export default function KnowledgeChunkViewWidget() {
  const { selectedChunk, isWidgetOpen, closeWidget } =
    useKnowledgeChunkViewStore();

  if (!isWidgetOpen || !selectedChunk) return null;

  return (
    <div className="fixed top-4 right-4 bg-card border border-border rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto z-50">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">
          Knowledge Chunk Details
        </h3>
        <button
          type="button"
          onClick={closeWidget}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Content
          </h4>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-foreground whitespace-pre-wrap">
              {selectedChunk.content}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Department
          </h4>
          <p className="text-foreground">
            {selectedChunk.department?.name || "No Department"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">ID</h4>
          <p className="text-muted-foreground font-mono text-xs">
            {selectedChunk.id}
          </p>
        </div>

        {selectedChunk.pointId && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Point ID
            </h4>
            <p className="text-muted-foreground font-mono text-xs">
              {selectedChunk.pointId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
