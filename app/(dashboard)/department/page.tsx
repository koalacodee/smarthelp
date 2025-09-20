import { Metadata } from "next";
import { DepartmentsService } from "@/lib/api";
import DepartmentsContainer from "./components/DepartmentsContainer";
import DepartmentEditingModal from "./components/DepartmentEditingModal";
import AddDepartmentButton from "./components/AddDepartmentButton";

export const metadata: Metadata = {
  title: "Departments | Organization Management",
  description:
    "Manage organizational departments, create and edit department structures",
};

export default async function DepartmentsPage() {
  const departments = await DepartmentsService.getAllDepartments();

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
          <AddDepartmentButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DepartmentsContainer departments={departments} />
        </div>
      </div>
      <DepartmentEditingModal />
    </>
  );
}
