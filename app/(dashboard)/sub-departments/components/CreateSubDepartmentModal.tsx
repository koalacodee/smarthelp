"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Department } from "@/lib/api/departments";
import { useCreateSubDepartmentStore } from "@/app/(dashboard)/store/useCreateSubDepartmentStore";
import useFormErrors from "@/hooks/useFormErrors";
import api from "@/lib/api";
import { useSubDepartmentsStore } from "@/app/(dashboard)/store/useSubDepartmentsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";

export default function CreateSubDepartmentModal() {
  const { isOpen, closeModal } = useCreateSubDepartmentStore();
  const { addSubDepartment } = useSubDepartmentsStore();
  const { addToast } = useToastStore();
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "name",
    "parentCategory",
  ]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api.DepartmentsService.getAllDepartments().then(setDepartments);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsSubmitting(true);
    try {
      const dept = await api.DepartmentsService.createSubDepartment({
        name,
        parentId,
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
      closeModal();
      setName("");
      setParentId("");
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            `Failed to Create Sub-Department ${name}. Please try again.`
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
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        aria-modal="true"
        role="dialog"
        onClick={closeModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-4">
              Create Sub-department
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sub-department Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                  placeholder="e.g., Domestic Shipping"
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
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="" disabled>
                    Select a parent category
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.parentCategory && (
                  <p className="mt-1 text-sm text-red-700">
                    {errors.parentCategory}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Sub-department"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
