"use client";

import { useDepartmentsStore } from "@/app/(dashboard)/department/store/useDepartmentsStore";
import DepartmentComponent from "./Department";
import { Department } from "@/lib/api/departments";
import { useEffect } from "react";

export default function DepartmentsContainer({
  departments,
}: {
  departments: Department[];
}) {
  const { departments: storedDepartments, setDepartments } =
    useDepartmentsStore();

  useEffect(() => {
    setDepartments(departments);
  }, []);

  return (
    <>
      {storedDepartments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No departments found</p>
        </div>
      )}
      {storedDepartments.map((department) => (
        <DepartmentComponent key={department.id} department={department} />
      ))}
    </>
  );
}
