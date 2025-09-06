"use client";
import React, { useState, useEffect } from "react";
import { SupervisorPermissions } from "@/lib/api/supervisors";
import { DepartmentsService, SupervisorsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { useSupervisorsStore } from "../store/useSupervisorsStore";
import { Department } from "@/lib/api/departments";

interface SupervisorEditModalProps {
  onSuccess?: () => void;
}

export default function SupervisorEditModal({
  onSuccess,
}: SupervisorEditModalProps) {
  const [username, setUsername] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<SupervisorPermissions[]>([]);
  const [assignedCategories, setAssignedCategories] = useState<string[]>([]);
  const { addToast } = useToastStore();
  const { supervisor, setIsEditing } = useCurrentEditingSupervisorStore();
  const { addSupervisor, updateSupervisor } = useSupervisorsStore();
  const [departments, setDepartments] = useState<Department[]>([]);

  const permissionOptions = Object.values(SupervisorPermissions);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await DepartmentsService.getAllDepartments();
        setDepartments(response);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (supervisor) {
      setUsername(supervisor.user.username || "");
      setEmployeeId(supervisor.user.employeeId || "");
      setJobTitle(supervisor.user.jobTitle || "");
      setPermissions(supervisor.permissions || []);
      setAssignedCategories(supervisor.departments.map(({ id }) => id) || []);
    } else {
      setUsername("");
      setEmployeeId("");
      setPassword("");
      setPermissions([]);
      setAssignedCategories([]);
      setJobTitle("");
    }
  }, [supervisor]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      addToast({
        message: "Please fill all required fields",
        type: "error",
      });
      return;
    }

    const supervisorData = {
      username: username,
      name: username,
      email: `${username}@company.com`,
      password: password,
      permissions: permissions,
      departmentIds: assignedCategories,
      jobTitle: jobTitle,
      employeeId: employeeId,
    };

    try {
      if (supervisor) {
        const response = await SupervisorsService.updateSupervisor(
          supervisor.id,
          {
            username: !!username ? username : undefined,
            name: !!username ? username : undefined,
            email: `${username}@company.com`,
            password: !!password ? password : undefined,
            permissions: permissions,
            departmentIds: assignedCategories,
            jobTitle: !!jobTitle ? jobTitle : undefined,
            employeeId: !!employeeId ? employeeId : undefined,
          }
        );
        updateSupervisor(supervisor.id, response);
        addToast({
          message: "Supervisor updated successfully",
          type: "success",
        });
      } else {
        if (!password) {
          addToast({
            message: "Password is required for new supervisors",
            type: "error",
          });
          return;
        }
        const response = await SupervisorsService.createSupervisor(
          supervisorData
        );
        addSupervisor(response);
        addToast({
          message: "Supervisor created successfully",
          type: "success",
        });
      }
      setIsEditing(false);
      onSuccess?.();
    } catch (error: any) {
      addToast({
        message: error?.response?.data?.message || "Operation failed",
        type: "error",
      });
    }
  };

  const togglePermission = (permission: SupervisorPermissions) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setAssignedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const modalTitle = supervisor ? "Edit Supervisor" : "Add New Supervisor";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <h3 className="text-xl font-bold mb-6 text-slate-800">
            {modalTitle}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="user-username"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="user-username"
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="user-employee-id"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Employee ID
                </label>
                <input
                  id="user-employee-id"
                  placeholder="e.g., A123"
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="user-designation"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Job Title / Designation
              </label>
              <input
                id="user-designation"
                placeholder="e.g., Shipping Supervisor"
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="user-password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Set New Password
              </label>
              <input
                id="user-password"
                placeholder="Leave blank to keep unchanged"
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!supervisor}
              />
            </div>
            <div className="pt-4 border-t mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assigned Categories
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                {departments.map((department) => (
                  <div key={department.id} className="flex items-center">
                    <input
                      id={`cat-${department.id}`}
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      type="checkbox"
                      checked={assignedCategories.includes(department.id)}
                      onChange={() => toggleCategory(department.id)}
                    />
                    <label
                      htmlFor={`cat-${department.id}`}
                      className="ml-2 text-sm text-slate-700 truncate"
                    >
                      {department.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Grant Admin-Level Permissions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionOptions.map((permission) => (
                  <div key={permission} className="relative flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id={`perm-${permission}`}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        type="checkbox"
                        checked={permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`perm-${permission}`}
                        className="font-medium text-gray-700"
                      >
                        {permission.replace(/_/g, " ")}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {supervisor ? "Save Changes" : "Create Supervisor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
