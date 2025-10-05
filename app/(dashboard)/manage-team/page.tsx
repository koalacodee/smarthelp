import { EmployeeService } from "@/lib/api/v2";
import { DepartmentsService } from "@/lib/api";
import EmployeePageClient from "./components/EmployeePageClient";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";

export default async function ManageTeamPage() {
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => res.json());

  const userRole = user.user.role;

  // Fetch data based on user role
  const [employeesData, subDepartmentsData, invitationRequestsData] =
    await Promise.all([
      EmployeeService.getAllEmployees(),
      DepartmentsService.getAllSubDepartments(),
      // Fetch invitation requests based on user role
      userRole === "ADMIN"
        ? EmployeeService.getAllEmployeeInvitationRequests()
        : EmployeeService.getMyEmployeeInvitationRequests(),
    ]);

  return (
    <EmployeePageClient
      initialEmployees={employeesData.employees}
      subDepartments={subDepartmentsData}
      initialInvitationRequests={invitationRequestsData.requests}
      userRole={userRole}
    />
  );
}
