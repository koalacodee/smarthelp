"use client";

import { useEffect } from "react";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";
import { DepartmentsService, TasksService } from "@/lib/api";
import TaskCard from "./TaskCard";
import DetailedTaskCard from "./DetailedTaskCard";
import EditTaskModal from "./EditTaskModal";
import { useTasksStore } from "../../store/useTasksStore";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";

export default function TasksPage() {
  const { user } = useUserStore();
  const { tasks, setTasks, isLoading, setLoading, error } = useTasksStore();
  const { setSubDepartments, setDepartments } = useTaskModalStore();
  const { setTaskAttachments } = useTaskAttachments();

  useEffect(() => {
    const fetch = async () => {
      if (user?.role === "SUPERVISOR") {
        setLoading(true);
        const [_, subTasks, empTasks] = await Promise.all([
          DepartmentsService.getAllSubDepartments().then(setSubDepartments),
          TasksService.getSubDepartmentLevel(),
          TasksService.getEmployeeLevel(),
        ]);
        setTasks([...subTasks, ...empTasks]);
        setLoading(false);
      } else if (user?.role === "ADMIN") {
        if (user?.role === "ADMIN") {
          await Promise.all([
            TasksService.getDepartmentLevel()
              .then((data) => {
                setTasks(data.data);
                setTaskAttachments(data.attachments);
              })
              .then(),
            DepartmentsService.getAllDepartments().then(setDepartments),
          ]);
        }
      }
    };
    fetch();
  }, [user]);

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
          {tasks.map((task) => (
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
      <EditTaskModal role={user?.role === "ADMIN" ? "admin" : "supervisor"} />
    </>
  );
}
