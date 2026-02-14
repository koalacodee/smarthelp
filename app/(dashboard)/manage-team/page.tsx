import { EmployeeService } from "@/lib/api/v2";
import { DepartmentsService } from "@/lib/api";
import EmployeePageClient from "./components/EmployeePageClient";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import { getLocale, getLanguage } from "@/locales/helpers";

export default async function ManageTeamPage() {
  const cookieStore = await cookies();
  const res = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  });
  const { user } = await res.json();

  if (!user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Please sign in to access this page.
      </div>
    );
  }

  const userRole = user.role;

  // Fetch data based on user role
  const [employeesData, subDepartmentsData, invitationRequestsData, departmentsData, locale, language] =
    await Promise.all([
      EmployeeService.getAllEmployees(),
      DepartmentsService.getAllSubDepartments(),
      // Fetch invitation requests based on user role
      userRole === "ADMIN"
        ? EmployeeService.getAllEmployeeInvitationRequests()
        : EmployeeService.getMyEmployeeInvitationRequests(),
      DepartmentsService.getAllDepartments(),
      getLocale(),
      getLanguage(),
    ]);

  return (
    <EmployeePageClient
      initialEmployees={employeesData?.employees ?? []}
      subDepartments={subDepartmentsData ?? []}
      departments={departmentsData ?? []}
      initialInvitationRequests={invitationRequestsData?.requests ?? []}
      userRole={userRole}
      locale={locale}
      language={language}
    />
  );
}
