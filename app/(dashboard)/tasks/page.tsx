import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { DepartmentsService, TasksService, TaskSubmission } from "@/lib/api";
import AddTaskButton from "./components/AddTaskButton";
import AddTaskModal from "./components/AddTaskModal";
import TaskPresetsModal from "./components/TaskPresetsModal";
import CreateTaskFromPresetModal from "./components/CreateTaskFromPresetModal";
import SubmitWorkModal from "./components/SubmitWorkModal";
import TasksPageClient from "./components/TasksPageClient";
import { env } from "next-runtime-env";
import { FileHubAttachment } from "@/lib/api/v2/models/faq";
import { getLocale, getLanguage } from "@/locales/helpers";

// Add the button back to the JSX
export const metadata: Metadata = {
  title: "Tasks | Task Management System",
  description: "Manage and track team tasks, assignments, and project progress",
};

export default async function Page() {
  const cookieStore = await cookies();

  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => {
    return res.json();
  });
  const userRole = user.user.role;

  if (userRole === "EMPLOYEE") {
    return redirect("/tasks/my-tasks");
  }

  // Fetch locale and language
  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  // Fetch data based on user role
  let tasks: any[] = [];
  let departments: any[] = [];
  let subDepartments: any[] = [];
  let attachments: any = {};
  let fileHubAttachments: FileHubAttachment[] = [];
  let metrics: any = null;
  let taskSubmissions: Record<string, TaskSubmission[]> = {};
  let delegationSubmissions: Record<string, any[]> = {};
  let submissionAttachments: Record<string, string[]> = {};

  if (userRole === "ADMIN") {
    const [_, fetchedDepartments] = await Promise.all([
      TasksService.getDepartmentLevel().then(async (data) => {
        tasks = data.data;
        attachments = data.attachments;
        fileHubAttachments = data.fileHubAttachments;
        metrics = data.metrics;

        (data.submissions || []).forEach((sub: any) => {
          if (!taskSubmissions[sub.taskId]) taskSubmissions[sub.taskId] = [];
          taskSubmissions[sub.taskId].push(sub);

          if (sub.delegationSubmission) {
            if (!delegationSubmissions[sub.taskId])
              delegationSubmissions[sub.taskId] = [];
            delegationSubmissions[sub.taskId].push(sub.delegationSubmission);
          }
        });
      }),
      DepartmentsService.getAllDepartments(),
    ]);
    departments = fetchedDepartments;
  } else if (userRole === "SUPERVISOR") {
    const [_, fetchedSubDepartments, fetchedDepartments] = await Promise.all([
      Promise.all([
        TasksService.getSubDepartmentLevel(),
        TasksService.getEmployeeLevel(),
      ]).then(async ([subTasks, empTasks]) => {
        tasks = [...subTasks.data, ...empTasks.data];
        attachments = {
          ...(subTasks.attachments || {}),
          ...(empTasks.attachments || {}),
        };
        fileHubAttachments = [
          ...subTasks.fileHubAttachments,
          ...empTasks.fileHubAttachments,
        ];

        [...subTasks.submissions, ...empTasks.submissions].forEach(
          (sub: any) => {
            if (!taskSubmissions[sub.taskId]) taskSubmissions[sub.taskId] = [];
            taskSubmissions[sub.taskId].push(sub);

            if (sub.delegationSubmission) {
              if (!delegationSubmissions[sub.taskId])
                delegationSubmissions[sub.taskId] = [];
              delegationSubmissions[sub.taskId].push(sub.delegationSubmission);
            }
          }
        );

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
      DepartmentsService.getAllDepartments(),
    ]);
    subDepartments = fetchedSubDepartments;
    departments = fetchedDepartments;
  }

  return (
    <>
      <div className="space-y-6">
        <TasksPageClient
          initialTasks={tasks}
          initialDepartments={departments}
          initialSubDepartments={subDepartments}
          initialAttachments={attachments}
          initialMetrics={metrics}
          initialTaskSubmissions={taskSubmissions}
          initialDelegationSubmissions={delegationSubmissions}
          initialSubmissionAttachments={submissionAttachments}
          userRole={userRole}
          initialFileHubAttachments={fileHubAttachments}
          locale={locale}
          language={language}
        />

        <AddTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
        <TaskPresetsModal />
        <CreateTaskFromPresetModal
          role={userRole === "ADMIN" ? "admin" : "supervisor"}
        />
        <SubmitWorkModal />
      </div>
      <AddTaskButton />
    </>
  );
}
