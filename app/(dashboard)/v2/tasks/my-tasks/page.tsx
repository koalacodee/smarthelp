import { cookies } from "next/headers";
import { DepartmentsService, EmployeeService } from "@/lib/api";
import { env } from "next-runtime-env";
import { getLocale, getLanguage } from "@/locales/helpers";
import MyTasksHydrator from "./_components/MyTasksHydrator";
import { Provider } from "../provider";

export default async function Page() {
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => res.json());

  const userRole = user.user.role as string;

  const [initialDepartments, initialSubDepartments, locale, language] =
    await Promise.all([
      userRole === "SUPERVISOR"
        ? DepartmentsService.getAllDepartments()
        : Promise.resolve([]),
      userRole === "EMPLOYEE"
        ? EmployeeService.getMySubDepartments()
        : Promise.resolve([]),
      getLocale(),
      getLanguage(),
    ]);

  return (
    <Provider>
      <MyTasksHydrator
        role={userRole.toLowerCase() as "admin" | "supervisor" | "employee"}
        departments={initialDepartments ?? []}
        subDepartments={initialSubDepartments ?? []}
        locale={locale}
        language={language}
      />
    </Provider>
  );
}

export const revalidate = 1;
