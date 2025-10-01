"use client";

import { useEffect, useState } from "react";
import { DepartmentsService, TasksService, UserResponse } from "@/lib/api";
import TaskCard from "./TaskCard";
import DetailedTaskCard from "./DetailedTaskCard";
import EditTaskModal from "./EditTaskModal";
import { useTasksStore } from "../../store/useTasksStore";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { useTaskAttachments } from "@/lib/store/useAttachmentsStore";

export default function TasksPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const { tasks, setTasks, isLoading, setLoading, error } = useTasksStore();
  const { setSubDepartments, setDepartments } = useTaskModalStore();
  const { setTaskAttachments } = useTaskAttachments();

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (user?.role === "SUPERVISOR") {
        setLoading(true);
        const [_, subTasks, empTasks] = await Promise.all([
          DepartmentsService.getAllSubDepartments().then(setSubDepartments),
          TasksService.getSubDepartmentLevel(),
          TasksService.getEmployeeLevel(),
        ]);
        setTasks([...subTasks.data, ...empTasks.data]);
        setTaskAttachments({
          ...subTasks.attachments,
          ...empTasks.attachments,
        });
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
