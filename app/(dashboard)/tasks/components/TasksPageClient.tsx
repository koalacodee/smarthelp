"use client";

import { useEffect } from "react";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";
import TaskCard from "./TaskCard";
import DetailedTaskCard from "./DetailedTaskCard";
import EditTaskModal from "./EditTaskModal";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";

interface TasksPageClientProps {
  initialTasks: any[];
  initialDepartments: any[];
  initialSubDepartments: any[];
  userRole?: string;
}

export default function TasksPageClient({
  initialTasks,
  initialDepartments,
  initialSubDepartments,
  userRole,
}: TasksPageClientProps) {
  const { user } = useUserStore();
  const { tasks, setTasks, isLoading, setLoading, error } = useTaskStore();
  const { setSubDepartments, setDepartments } = useTaskModalStore();
  const { setTaskAttachments } = useTaskAttachments();

  useEffect(() => {
    // Initialize with server data
    setTasks(initialTasks);
    setDepartments(initialDepartments);
    setSubDepartments(initialSubDepartments);
  }, [
    initialTasks,
    initialDepartments,
    initialSubDepartments,
    setTasks,
    setDepartments,
    setSubDepartments,
  ]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks found
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="bg-background p-4 rounded-md shadow-md"
            >
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      )}
      <DetailedTaskCard />
      <EditTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
    </>
  );
}
