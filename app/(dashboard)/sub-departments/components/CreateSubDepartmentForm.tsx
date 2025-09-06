import { useSubDepartmentsStore } from "@/app/(dashboard)/store/useSubDepartmentsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import { Department } from "@/lib/api/departments";
import { useState } from "react";

export default function CreateSubDepartmentForm({
  departments,
}: {
  departments: Department[];
}) {
  const [parentCategory, setParentCategory] = useState<string>("");
  const [name, setName] = useState<string>("");
  const addSubDepartment = useSubDepartmentsStore(
    (state) => state.addSubDepartment
  );
  const addToast = useToastStore(({ addToast }) => addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    api.DepartmentsService.createSubDepartment({
      name,
      parentId: parentCategory,
    })
      .then((dept) => {
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
      })
      .catch(() =>
        addToast({
          message: `Failed to Create Sub-Department ${name}`,
          type: "error",
        })
      );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4"
    >
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
