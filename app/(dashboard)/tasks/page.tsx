import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import api, {
  DepartmentsService,
  TasksService,
  TaskSubmission,
} from "@/lib/api";
import AddTaskButton from "./components/AddTaskButton";
import AddTaskModal from "./components/AddTaskModal";
import SubmitWorkModal from "./components/SubmitWorkModal";
import TasksPageClient from "./components/TasksPageClient";
import { env } from "next-runtime-env";

export const metadata: Metadata = {
  title: "Tasks | Task Management System",
  description: "Manage and track team tasks, assignments, and project progress",
};

type UserRole = "EMPLOYEE" | "ADMIN" | "SUPERVISOR";

export default async function Page() {
  const cookieStore = await cookies();
  console.log(env("NEXT_PUBLIC_BASE_URL"));

  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => {
    console.log(res);
    return res.json();
  });
  const userRole = user.user.role;

  if (userRole === "EMPLOYEE") {
    return redirect("/tasks/my-tasks");
  }

  // Fetch data based on user role
  let tasks: any[] = [];
  let departments: any[] = [];
  let subDepartments: any[] = [];
  let attachments: any = {};
  let metrics: any = null;
  let taskSubmissions: Record<string, TaskSubmission[]> = {};
  let submissionAttachments: Record<string, string[]> = {};

  if (userRole === "ADMIN") {
    const [_, fetchedDepartments] = await Promise.all([
      TasksService.getDepartmentLevel().then(async (data) => {
        await Promise.all(
          data.data.map(async (task) => {
            const submissions = await TasksService.getTaskSubmissions(task.id);
            taskSubmissions[task.id] = submissions.taskSubmissions;
            // Store submission attachments
            Object.entries(submissions.attachments).forEach(
              ([submissionId, attachmentIds]) => {
                submissionAttachments[submissionId] = attachmentIds;
              }
            );
          })
        );
        tasks = data.data;
        attachments = data.attachments;
        metrics = data.metrics;
      }),
      DepartmentsService.getAllDepartments(),
    ]);
    departments = fetchedDepartments;
    console.log(taskSubmissions);
  } else if (userRole === "SUPERVISOR") {
    const [_, fetchedSubDepartments] = await Promise.all([
      Promise.all([
        TasksService.getSubDepartmentLevel(),
        TasksService.getEmployeeLevel(),
      ]).then(async ([subTasks, empTasks]) => {
        const allTasks = [...subTasks.data, ...empTasks.data];
        await Promise.all(
          allTasks.map(async (task) => {
            const submissions = await TasksService.getTaskSubmissions(task.id);
            taskSubmissions[task.id] = submissions.taskSubmissions;
            // Store submission attachments
            Object.entries(submissions.attachments).forEach(
              ([submissionId, attachmentIds]) => {
                submissionAttachments[submissionId] = attachmentIds;
              }
            );
          })
        );
        tasks = allTasks;
        attachments = {
          ...(subTasks.attachments || {}),
          ...(empTasks.attachments || {}),
        };
        // Combine metrics from both sub-department and employee level tasks
        metrics = {
          pendingCount:
            (subTasks.metrics?.pendingCount || 0) +
            (empTasks.metrics?.pendingCount || 0),
          completedCount:
            (subTasks.metrics?.completedCount || 0) +
            (empTasks.metrics?.completedCount || 0),
          completionPercentage: Math.round(
            (((subTasks.metrics?.completedCount || 0) +
              (empTasks.metrics?.completedCount || 0)) /
              Math.max(
                (subTasks.metrics?.pendingCount || 0) +
                  (empTasks.metrics?.pendingCount || 0) +
                  (subTasks.metrics?.completedCount || 0) +
                  (empTasks.metrics?.completedCount || 0),
                1
              )) *
              100
          ),
        };
      }),
      DepartmentsService.getAllSubDepartments(),
    ]);
    subDepartments = fetchedSubDepartments;
    console.log(taskSubmissions);
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
          initialMetrics={metrics}
          initialTaskSubmissions={taskSubmissions}
          initialSubmissionAttachments={submissionAttachments}
          userRole={userRole}
        />

        <AddTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
        <SubmitWorkModal />
      </div>
    </>
  );
}
