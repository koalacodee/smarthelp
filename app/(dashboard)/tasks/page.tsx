import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { DepartmentsService, TasksService } from "@/lib/api";
import AddTaskButton from "./components/AddTaskButton";
import AddTaskModal from "./components/AddTaskModal";
import SubmitWorkModal from "./components/SubmitWorkModal";
import TasksPageClient from "./components/TasksPageClient";

export const metadata: Metadata = {
  title: "Tasks | Task Management System",
  description: "Manage and track team tasks, assignments, and project progress",
};

type UserRole = "EMPLOYEE" | "ADMIN" | "SUPERVISOR";

export default async function Page() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user-role")?.value as UserRole | undefined;

  if (userRole === "EMPLOYEE") {
    return redirect("/tasks/my-tasks");
  }

  // Fetch data based on user role
  let tasks: any[] = [];
  let departments: any[] = [];
  let subDepartments: any[] = [];
  let attachments: any = {};

  if (userRole === "ADMIN") {
    const [departmentData, departmentsData] = await Promise.all([
      TasksService.getDepartmentLevel(),
      DepartmentsService.getAllDepartments(),
    ]);
    tasks = departmentData.data;
    departments = departmentsData;
    attachments = departmentData.attachments || {};
  } else if (userRole === "SUPERVISOR") {
    const [subDepartmentsData, subTasks, empTasks] = await Promise.all([
      DepartmentsService.getAllSubDepartments(),
      TasksService.getSubDepartmentLevel(),
      TasksService.getEmployeeLevel(),
    ]);
    tasks = [...subTasks.data, ...empTasks.data];
    subDepartments = subDepartmentsData;
    attachments = {
      ...(subTasks.attachments || {}),
      ...(empTasks.attachments || {}),
    };
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Team Tasks</h2>
          <AddTaskButton />
        </div>

        <TasksPageClient
          initialTasks={tasks}
          initialDepartments={departments}
          initialSubDepartments={subDepartments}
          initialAttachments={attachments}
          userRole={userRole}
        />

        <AddTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
        <SubmitWorkModal />
      </div>
    </>
  );
}
