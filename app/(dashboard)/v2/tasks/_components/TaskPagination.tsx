"use client";

import type { CursorMeta } from "@/services/tasks/types";
import { useV2TaskPageStore } from "../_store/use-v2-task-page-store";
import ChevronLeft from "@/icons/ChevronLeft";
import ChevronRight from "@/icons/ChevronRight";

interface TaskPaginationProps {
  meta: CursorMeta | undefined;
}

export default function TaskPagination({ meta }: TaskPaginationProps) {
  const { setCursor } = useV2TaskPageStore();

  if (!meta) return null;
  if (!meta.hasNextPage && !meta.hasPrevPage) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={() => setCursor(meta.prevCursor, "prev")}
        disabled={!meta.hasPrevPage}
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <button
        onClick={() => setCursor(meta.nextCursor, "next")}
        disabled={!meta.hasNextPage}
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
