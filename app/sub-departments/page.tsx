"use client";
import api from "@/lib/api";
import { Department } from "@/lib/api/departments";
import { useEffect, useState } from "react";
import CreateSubDepartmentForm from "./components/CreateSubDepartmentForm";
import SubDepartmentActions from "./components/SubDepartmentActions";
import EditSubDepartmentModal from "./components/EditSubDepartmentModal";
import { useSubDepartmentsStore } from "@/app/store/useSubDepartmentsStore";

export default function Page() {
  const { subDepartments, isLoading, error, setSubDepartments, setLoading, setError } = useSubDepartmentsStore();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch departments for the create form
        const departmentsData = await api.DepartmentsService.getAllDepartments();
        setDepartments(departmentsData);
        
        // Fetch real sub-departments
        const subDepartmentsData = await api.DepartmentsService.getAllSubDepartments();
        setSubDepartments(subDepartmentsData);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setSubDepartments, setLoading, setError]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-slate-800">
          Create New Sub-department
        </h3>
        <p className="text-sm text-slate-600 mt-1 mb-4">
          Create specific sections within your main categories. You can then
          assign employees to these sections in the 'Manage Team' tab.
        </p>
        <CreateSubDepartmentForm departments={departments} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          Your Sub-departments
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">
            Loading sub-departments...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        ) : subDepartments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No sub-departments found.
          </div>
        ) : (
          <div className="space-y-3">
            {subDepartments.map((subDepartment) => (
              <div key={subDepartment.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors flex-wrap gap-2">
                <div>
                  <p className="font-bold text-slate-800">{subDepartment.name}</p>
                  <p className="text-xs text-slate-500">
                    Under Category: {subDepartment.parent?.name || 'Unknown'}
                  </p>
                </div>
                <SubDepartmentActions subDepartment={subDepartment} />
              </div>
            ))}
          </div>
        )}
      </div>
      <EditSubDepartmentModal />
    </div>
  );
}
