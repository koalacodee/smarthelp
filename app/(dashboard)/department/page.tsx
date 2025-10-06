import { Metadata } from "next";
import { DepartmentsService } from "@/lib/api";
import CombinedDepartmentsPage from "./components/CombinedDepartmentsPage";

export const metadata: Metadata = {
  title: "Departments | Organization Management",
  description:
    "Manage organizational departments, create and edit department structures",
};

export default async function DepartmentsPage() {
  const departments = await DepartmentsService.getAllDepartments();
  return <CombinedDepartmentsPage departments={departments} />;
}
