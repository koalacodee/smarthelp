import { useSubDepartmentsStore } from "@/app/(dashboard)/store/useSubDepartmentsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import { Department } from "@/lib/api/departments";
import { useState } from "react";
import useFormErrors from "@/hooks/useFormErrors";

export default function CreateSubDepartmentForm({
  departments,
}: {
  departments: Department[];
}) {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "name",
    "parentCategory",
  ]);
  const [parentCategory, setParentCategory] = useState<string>("");
  const [name, setName] = useState<string>("");
  const addSubDepartment = useSubDepartmentsStore(
    (state) => state.addSubDepartment
  );
  const addToast = useToastStore(({ addToast }) => addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      const dept = await api.DepartmentsService.createSubDepartment({
        name,
        parentId: parentCategory,
      });

      addSubDepartment({
        id: dept.id,
        name: dept.name,
        parent: dept?.parent,
        visibility: dept.visibility,
      });
      addToast({
        message: `Sub-Department ${dept.name} Created Successfully`,
        type: "success",
      });
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            `Failed to Create Sub-Department ${name}. Please try again.`
        );
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4"
    >
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="sd-name"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Sub-department Name
          </label>
          <input
            id="sd-name"
            className="w-full p-2 border border-slate-300 rounded-md"
            placeholder="e.g., Domestic Shipping"
            required
            type="text"
            defaultValue=""
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-700">{errors.name}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="sd-category"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Parent Category
          </label>
          <select
            id="sd-category"
            className="w-full p-2 border border-slate-300 rounded-md bg-white"
            required
            onChange={(e) => setParentCategory(e.target.value)}
          >
            {departments.map((dept) => (
              <option value={dept.id} key={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.parentCategory && (
            <p className="mt-1 text-sm text-red-700">{errors.parentCategory}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Create Section
        </button>
      </div>
    </form>
  );
}
