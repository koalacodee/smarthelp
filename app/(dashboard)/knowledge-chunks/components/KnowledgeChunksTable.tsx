"use client";
import React from "react";
import { GroupedKnowledgeChunks } from "../page";
import KnowledgeChunkActions from "./KnowledgeChunkActions";
import { useKnowledgeChunksStore } from "../store/useKnowledgeChunksStore";
import { useEffect } from "react";
import { KnowledgeChunksService } from "@/lib/api";
import RefreshButton from "@/components/ui/RefreshButton";
import { useKnowledgeChunkViewStore } from "../store/useKnowledgeChunkViewStore";

export default function KnowledgeChunksTable() {
  const { chunks: storedChunks, setChunks } = useKnowledgeChunksStore();

  useEffect(() => {
    loadChunks();
  }, []);

  async function loadChunks() {
    try {
      const response = await KnowledgeChunksService.getAllKnowledgeChunks();
      const chunks = response.data.data || [];

      // Group chunks by department
      const groupedMap = new Map<string, GroupedKnowledgeChunks>();

      chunks.forEach((chunk) => {
        const dept = chunk.department;
        if (dept) {
          const key = dept.id;
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              departmentId: key,
              departmentName: dept.name,
              chunks: [],
            });
          }
          groupedMap.get(key)!.chunks.push(chunk);
        }
      });

      setChunks(Array.from(groupedMap.values()));
    } catch (error) {
      console.error("Error loading knowledge chunks:", error);
    }
  }

  return (
    <>
      <RefreshButton onRefresh={loadChunks} />
      <table className="min-w-full divide-y divide-border overflow-auto">
        <thead className="bg-muted">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Content
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Department
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {storedChunks.map((group) =>
            group.chunks.length > 0 ? (
              <React.Fragment key={group.departmentId}>
                <tr className="bg-muted/50 border-t border-b border-border">
                  <td
                    colSpan={4}
                    className="px-6 py-2 text-left text-sm font-semibold text-foreground"
                  >
                    {group.departmentName}
                  </td>
                </tr>
                {group.chunks.map((chunk) => (
                  <tr
                    key={chunk.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => useKnowledgeChunkViewStore.getState().toggleWidget(chunk)}
                  >
                    <td className="px-6 py-4 max-w-md">
                      <p
                        className="text-sm text-foreground truncate"
                        title={chunk.content}
                      >
                        {chunk.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {chunk.department?.name ?? (
                        <span className="italic text-muted-foreground/70">
                          No Department
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <KnowledgeChunkActions
                        chunkId={chunk.id!}
                        departmentId={group.departmentId}
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ) : null
          )}
        </tbody>
      </table>
    </>
  );
}
