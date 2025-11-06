import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import AdminDashboard from "./components/admin-dashboard/AdminDashboard";
import EmployeeDashboard from "./components/employee-dashboard/EmployeeDashboard";

export const metadata = {
  title: "Dashboard | SmartHelp",
  description: "Overview of system metrics and actions",
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
    return <EmployeeDashboard />;
  } else {
    return <AdminDashboard />;
  }
}
