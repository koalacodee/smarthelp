"use client";

// import { Loader2 } from 'lucide-react';
import Loader2 from "@/icons/Loader2";
import MyTaskCard from "./MyTaskCard";
import EmptyState from "../../_components/EmptyState";
import type {
  MyTaskItemResponse,
} from "@/services/tasks/types";

interface MyTasksListProps {
  tasks: MyTaskItemResponse[];
  isLoading: boolean;
}

export default function MyTasksList({
  tasks,
  isLoading,
}: MyTasksListProps) {


  const isEmpty = tasks.length === 0;

  if (isLoading && isEmpty) {
    return (
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <div className="space-y-0">
        {/* Render tasks */}
        {tasks.map((item) => (
          <MyTaskCard key={item.task.id} item={item} />
        ))}
      </div>
    </div>
  );
}
