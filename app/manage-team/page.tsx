"use client";

import api from "@/lib/api";
import { useEmployeesStore } from "@/app/store/useEmployeesStore";
import { useEffect } from "react";
import EmployeeActions from "./components/EmployeeActions";
import EditEmployeeModal from "./components/EditEmployeeModal";

export default function ManageTeamPage() {
  const { employees, isLoading, error, setEmployees, setLoading, setError } =
    useEmployeesStore();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.EmployeeService.getAllEmployees();
        setEmployees(data);
      } catch (err) {
        setError("Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [setEmployees, setLoading, setError]);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          Manage Your Team
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Grant or revoke sub-department access and specific abilities for
          employees on your team.
        </p>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Employee ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Designation
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Assigned Sub-departments
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Granted Abilities
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {employee.user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {employee.user.employeeId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {employee.user.jobTitle || "N/A"}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {employee.subDepartments.length > 0 ? (
                        <p
                          className="text-sm text-slate-500 truncate"
                          title={employee.subDepartments
                            .map((sd) => sd.name)
                            .join(", ")}
                        >
                          {employee.subDepartments
                            .map((sd) => sd.name)
                            .join(", ")}
                        </p>
                      ) : (
                        <span className="italic text-slate-400 text-sm">
                          No sub-departments
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {employee.permissions.length > 0 ? (
                          employee.permissions.map((permission, index) => (
                            <span
                              key={index}
                              className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize"
                            >
                              {permission.split("_")[0].toLowerCase()}
                            </span>
                          ))
                        ) : (
                          <span className="italic text-slate-400 text-sm">
                            No permissions
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <EmployeeActions employee={employee} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EditEmployeeModal />
    </>
  );
}
