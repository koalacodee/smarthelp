import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import { getLocale, getLanguage } from "@/locales/helpers";
import AdminDashboard from "./components/admin-dashboard/AdminDashboard";
import EmployeeDashboard from "./components/employee-dashboard/EmployeeDashboard";

export const metadata = {
  title: "Dashboard | SmartHelp",
  description: "Overview of system metrics and actions",
};

export default async function Page() {
  const cookieStore = await cookies();
  const [userData, locale, language] = await Promise.all([
    fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
      headers: { Cookie: cookieStore.toString() },
    }).then((res) => res.json()),
    getLocale(),
    getLanguage(),
  ]);
  const userRole = userData.user.role;

  if (userRole === "EMPLOYEE") {
    return <EmployeeDashboard locale={locale} language={language} />;
  } else {
    return <AdminDashboard locale={locale} language={language} />;
  }
}
