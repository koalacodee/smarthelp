import { Metadata } from "next";
import { DepartmentsService } from "@/lib/api";
import CombinedDepartmentsPage from "./components/CombinedDepartmentsPage";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";

export const metadata: Metadata = {
  title: "Departments | Organization Management",
  description:
    "Manage organizational departments, create and edit department structures",
};

export default async function DepartmentsPage() {
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  })
    .then((res) => res.json())
    .then((data) => data.user);
  let departments;
  let subDepartments;
  if (user.role === "ADMIN") {
    departments = await DepartmentsService.getAllDepartments();
  } else if (user.role === "SUPERVISOR") {
    subDepartments = await DepartmentsService.getAllSubDepartments();
  }
  return (
    <CombinedDepartmentsPage
      departments={departments}
      subDepartments={subDepartments}
      userRole={user.role}
    />
  );
}
