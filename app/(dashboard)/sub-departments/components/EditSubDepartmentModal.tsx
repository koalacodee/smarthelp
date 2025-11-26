import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Department } from "@/lib/api/departments";
import { useEditSubDepartmentStore } from "@/app/(dashboard)/store/useEditSubDepartmentStore";
import { useSubDepartmentsStore } from "@/app/(dashboard)/store/useSubDepartmentsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { DepartmentsService } from "@/lib/api";
import { UpdateSubDepartmentInputDto } from "@/lib/api/departments";
import useFormErrors from "@/hooks/useFormErrors";

export default function EditSubDepartmentModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "name",
    "parentId",
  ]);
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
      } catch (error) {}
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubDepartment) return;

    clearErrors();
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
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            "Failed to update sub-department. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4"
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-4">
            Edit Sub-department
          </h3>

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
              {errors.name && (
                <p className="mt-1 text-sm text-red-700">{errors.name}</p>
              )}
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
              {errors.parentId && (
                <p className="mt-1 text-sm text-red-700">{errors.parentId}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
