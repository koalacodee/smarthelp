import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { DepartmentsService, TasksService } from "@/lib/api";
import { env } from "next-runtime-env";
import { getLocale, getLanguage } from "@/locales/helpers";
import TaskPageHydrator from "./_components/TaskPageHydrator";
import { Provider } from "./provider";

export const metadata: Metadata = {
  title: "Tasks | Task Management System",
  description: "Manage and track team tasks, assignments, and project progress",
};

export default async function Page() {
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => res.json());

  const userRole = user.user.role as string;

  if (userRole === "EMPLOYEE") {
    return redirect("/v2/tasks/my-tasks");
  }

  const [locale, language] = await Promise.all([getLocale(), getLanguage()]);

  let initialData: any = null;
  let departments: any[] = [];
  let subDepartments: any[] = [];

  if (userRole === "ADMIN") {
    const [taskData, fetchedDepartments] = await Promise.all([
      TasksService.getDepartmentLevel(),
      DepartmentsService.getMainDepartmentsForAdmin(),
    ]);
    initialData = taskData;
    departments = fetchedDepartments;
  } else if (userRole === "SUPERVISOR") {
    const [taskData, fetchedSubDepartments, fetchedDepartments] =
      await Promise.all([
        TasksService.getTeamTasks(),
        DepartmentsService.getAllSubDepartments(),
        DepartmentsService.getAllDepartments(),
      ]);
    initialData = taskData;
    subDepartments = fetchedSubDepartments;
    departments = fetchedDepartments;
  }

  return (
    <Provider>
      <TaskPageHydrator
        initialData={initialData}
        role={userRole === "ADMIN" ? "admin" : "supervisor"}
        departments={departments}
        subDepartments={subDepartments}
        locale={locale}
        language={language}
      />
    </Provider>
  );
}
