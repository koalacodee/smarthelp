"use client";

import XMarkIcon from "@/icons/XCircle";
import { useCurrentEditingDepartment } from "@/app/(dashboard)/department/store/useCurrentEditingDepartment";
import { DepartmentsService } from "@/lib/api";
import {
  CreateDepartmentInputDto,
  DepartmentVisibility,
} from "@/lib/api/departments";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useState, useEffect } from "react";
import { useDepartmentsStore } from "../store/useDepartmentsStore";
import useFormErrors from "@/hooks/useFormErrors";

export default function DepartmentEditingModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "name",
    "visibility",
  ]);
  const { department, isOpen, mode, closeModal } =
    useCurrentEditingDepartment();
  const { addToast } = useToastStore();
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [isLoading, setIsLoading] = useState(false);
  const addDepartment = useDepartmentsStore((state) => state.addDepartment);
  const updateDepartment = useDepartmentsStore(
    (state) => state.updateDepartment
  );

  useEffect(() => {
    if (department) {
      setName(department.name);
      setVisibility(department.visibility);
    } else {
      setName("");
      setVisibility("PUBLIC");
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const dto: CreateDepartmentInputDto = {
        name,
        visibility: DepartmentVisibility[visibility],
      };

      if (mode === "add") {
        await DepartmentsService.createDepartment(dto).then((dept) =>
          addDepartment({
            id: dept.id,
            name: dept.name,
            visibility: dept.visibility,
          })
        );
        addToast({
          type: "success",
          message: "Department created successfully",
        });
      } else if (department) {
        await DepartmentsService.updateMainDepartment(department.id, dto).then(
          (dept) => {
            updateDepartment(dept.id, {
              name: dept.name,
              visibility: dept.visibility,
            });
          }
        );
        addToast({
          type: "success",
          message: "Department updated successfully",
        });
      }

      closeModal();
    } catch (error: any) {
      console.error("Department save error:", error);
      console.log("Department save error:", error);
      console.log("Error response data:", error?.response?.data);
      
      if (error?.response?.data?.data?.details) {
        console.log("Setting field errors:", error?.response?.data?.data?.details);
        setErrors(error?.response?.data?.data?.details);
      } else {
        console.log("Setting root error");
        setRootError(
          error?.response?.data?.message || `Failed to ${mode} department. Please try again.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md animate-scale-in">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {mode === "add" ? "Add New Department" : "Edit Department"}
            </h3>
            <button
              type="button"
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          {errors.root && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>{errors.root}</span>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-700">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "PUBLIC" | "PRIVATE")
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              {errors.visibility && (
                <p className="mt-1 text-sm text-red-700">
                  {errors.visibility}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Saving..."
                : mode === "add"
                ? "Add Department"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
