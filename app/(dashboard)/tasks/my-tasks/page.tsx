import { TasksService, DepartmentsService, EmployeeService } from "@/lib/api";
import { TaskDelegationService } from "@/lib/api/v2";
import MyTasks from "./components/MyTasks";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import TasksPageWrapper from "./components/TasksPageWrapper";
import { getLocale, getLanguage } from "@/locales/helpers";

export default async function Page() {
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => res.json());

  const userRole = user.user.role as string;

  const [response, delegationsData, initialDepartments, initialSubDepartments] =
    await Promise.all([
      TasksService.getMyTasks(),
      userRole === "SUPERVISOR"
        ? TaskDelegationService.getMyDelegations({})
        : Promise.resolve(null),
      userRole === "SUPERVISOR"
        ? DepartmentsService.getAllDepartments()
        : Promise.resolve([]),
      userRole === "EMPLOYEE"
        ? EmployeeService.getMySubDepartments()
        : Promise.resolve([]),
    ]);

  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return (
    <TasksPageWrapper
      tasksData={response}
      delegationsData={delegationsData}
      userRole={userRole}
      locale={locale}
      language={language}
      initialDepartments={initialDepartments ?? []}
      initialSubDepartments={initialSubDepartments ?? []}
    />
  );
}

export const revalidate = 1;
