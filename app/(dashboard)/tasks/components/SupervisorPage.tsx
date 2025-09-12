"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";
import { useSupervisorTasksStore } from "@/app/(dashboard)/store/useSupervisorTasksStore";
import { Department } from "@/lib/api/departments";
import { TicketAssignee } from "@/lib/api";
import api from "@/lib/api";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import SubmitWorkModal from "./SubmitWorkModal";
import Button from "@/components/ui/Button";

export default function SupervisorPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUserStore();
  const {
    subDepartmentTasks,
    employeeTasks,
    isLoading,
    error,
    fetchSubDepartmentTasks,
    fetchEmployeeTasks,
    refreshTasks,
  } = useSupervisorTasksStore();
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (user?.role === "SUPERVISOR") {
      api.DepartmentsService.getAllSubDepartments().then(setSubDepartments);
      fetchSubDepartmentTasks();
      fetchEmployeeTasks();
    }
  }, [user, fetchSubDepartmentTasks, fetchEmployeeTasks]);

  if (user?.role !== "SUPERVISOR") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Team Tasks</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add New Task</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : [...employeeTasks, ...subDepartmentTasks].length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...employeeTasks, ...subDepartmentTasks].map((task) => (
            <div
              key={task.id}
              className="bg-background p-4 rounded-md shadow-md"
            >
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subDepartments={subDepartments}
        refreshTasks={refreshTasks}
      />

      <SubmitWorkModal />
    </div>
  );
}
