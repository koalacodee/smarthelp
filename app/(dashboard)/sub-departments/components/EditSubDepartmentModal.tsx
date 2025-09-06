import React, { useState, useEffect } from "react";
import { Department } from "@/lib/api/departments";
import { useEditSubDepartmentStore } from "@/app/(dashboard)/store/useEditSubDepartmentStore";
import { useSubDepartmentsStore } from "@/app/(dashboard)/store/useSubDepartmentsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { DepartmentsService } from "@/lib/api";
import { UpdateSubDepartmentInputDto } from "@/lib/api/departments";

export default function EditSubDepartmentModal() {
  const { isOpen, currentSubDepartment, closeModal } =
    useEditSubDepartmentStore();
  const { updateSubDepartment } = useSubDepartmentsStore();
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (currentSubDepartment) {
      setFormData({
        name: currentSubDepartment.name,
        parentId: currentSubDepartment?.parent?.id || "",
      });
    }
  }, [currentSubDepartment]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await DepartmentsService.getAllDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubDepartment) return;

    setIsSubmitting(true);
    try {
      const updateDto: UpdateSubDepartmentInputDto = {
        name: formData.name,
        parentId: formData.parentId,
      };

      const updatedSubDepartment = await DepartmentsService.updateSubDepartment(
        currentSubDepartment.id,
        updateDto
      );

      updateSubDepartment(currentSubDepartment.id, updatedSubDepartment);
      addToast({
        message: "Sub-department updated successfully",
        type: "success",
      });
      closeModal();
    } catch (error) {
      addToast({ message: "Failed to update sub-department", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 w-full max-w-md animate-scale-in">
        <h3 className="text-lg font-semibold mb-4">Edit Sub-department</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sub-department Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Parent Category
            </label>
            <select
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-md bg-white"
              required
            >
              <option value="">Select a parent category</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
