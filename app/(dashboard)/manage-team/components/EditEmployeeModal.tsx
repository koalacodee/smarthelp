import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditEmployeeStore } from "@/app/(dashboard)/store/useEditEmployeeStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useEmployeesStore } from "@/app/(dashboard)/store/useEmployeesStore";
import api from "@/lib/api";
import { EmployeePermissionsEnum } from "@/lib/api/v2/services/employee";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { EmployeeService } from "@/lib/api/v2";
import useFormErrors from "@/hooks/useFormErrors";

export default function EditEmployeeModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "jobTitle",
    "employeeId",
    "password",
  ]);
  const {
    isOpen,
    currentEmployee,
    formData,
    isSubmitting,
    closeModal,
    setFormData,
    setIsSubmitting,
  } = useEditEmployeeStore();
  const { addToast } = useToastStore();
  const { updateEmployee } = useEmployeesStore();
  const [subDepartments, setSubDepartments] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingSubDepartments, setIsLoadingSubDepartments] = useState(false);

  useEffect(() => {
    const fetchSubDepartments = async () => {
      setIsLoadingSubDepartments(true);
      try {
        const data = await api.DepartmentsService.getAllSubDepartments();
        setSubDepartments(data);
      } catch (error) {
        // Failed to fetch sub-departments
      } finally {
        setIsLoadingSubDepartments(false);
      }
    };

    if (isOpen) {
      fetchSubDepartments();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    clearErrors();
    setIsSubmitting(true);
    try {
      await EmployeeService.updateEmployee(currentEmployee.id, formData);

      // Update the employees list in the store with client-side calculations
      const updatedEmployee = {
        ...currentEmployee,
        permissions: formData.permissions || currentEmployee.permissions,
        subDepartments: formData.subDepartmentIds
          ? subDepartments.filter((subDept) =>
              formData.subDepartmentIds?.includes(subDept.id)
            )
          : currentEmployee.subDepartments,
        user: {
          ...currentEmployee.user,
          jobTitle: formData.jobTitle || currentEmployee.user.jobTitle,
          employeeId: formData.employeeId || currentEmployee.user.employeeId,
        },
      };

      updateEmployee(currentEmployee.id, updatedEmployee as any);

      addToast({ message: "Employee updated successfully", type: "success" });
      closeModal();
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            "Failed to update employee. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (
    field: string,
    value: string,
    checked: boolean
  ) => {
    const currentValues = (formData as any)[field] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);

    setFormData({ [field]: newValues });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ [field]: value });
  };

  if (!isOpen || !currentEmployee) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={closeModal}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
            >
              Manage Permissions
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-slate-600 mb-6"
            >
              for{" "}
              <span className="font-semibold text-slate-800">
                {currentEmployee.user.username}
              </span>
            </motion.p>

            {errors.root && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <label className="text-sm font-medium text-slate-700">
                    Assigned Sub-departments
                  </label>
                  <InfoTooltip
                    content="Select sub-departments where this employee will work. Multiple selections allowed for cross-departmental roles."
                    position="top"
                    maxWidth="300px"
                    delay={100}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="space-y-4 max-h-64 overflow-y-auto"
                >
                  {isLoadingSubDepartments ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                      className="text-center py-8 text-slate-500"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                        className="w-12 h-12 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center"
                      >
                        <svg
                          className="w-6 h-6 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </motion.div>
                      Loading sub-departments...
                    </motion.div>
                  ) : (
                    <div className="grid overflow-x-hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {subDepartments.map((subDept, index) => {
                        const isSelected =
                          formData.subDepartmentIds?.includes(subDept.id) ||
                          false;
                        return (
                          <motion.button
                            key={subDept.id}
                            type="button"
                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.6 + index * 0.05,
                              ease: "backOut",
                            }}
                            whileHover={{
                              scale: 1.05,
                              y: -2,
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const currentSubDeptIds =
                                formData.subDepartmentIds || [];
                              const newSubDeptIds = isSelected
                                ? currentSubDeptIds.filter(
                                    (subDeptId: string) =>
                                      subDeptId !== subDept.id
                                  )
                                : [...currentSubDeptIds, subDept.id];

                              setFormData({
                                subDepartmentIds: newSubDeptIds,
                              });
                            }}
                            className={`
                              relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                                  : "bg-white text-slate-700 border border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                              }
                            `}
                          >
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.2,
                                delay: 0.7 + index * 0.05,
                              }}
                              className="relative z-10"
                            >
                              {subDept.name}
                            </motion.span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: "backOut",
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <motion.svg
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.1,
                                  }}
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </motion.svg>
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="block text-sm font-medium text-slate-700 mb-4"
                >
                  Granted Abilities
                </motion.label>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                >
                  {Object.values(EmployeePermissionsEnum).map(
                    (permission, index) => {
                      const isSelected =
                        formData.permissions?.includes(permission) || false;
                      const permissionLabel = permission
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase());
                      return (
                        <motion.button
                          key={permission}
                          type="button"
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.8 + index * 0.05,
                            ease: "backOut",
                          }}
                          whileHover={{
                            scale: 1.05,
                            y: -2,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleCheckboxChange(
                              "permissions",
                              permission,
                              !isSelected
                            )
                          }
                          className={`
                          relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            isSelected
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                              : "bg-white text-slate-700 border border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                          }
                        `}
                        >
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.2,
                              delay: 0.9 + index * 0.05,
                            }}
                            className="relative z-10 block"
                          >
                            {permissionLabel}
                          </motion.span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ duration: 0.3, ease: "backOut" }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </motion.svg>
                            </motion.div>
                          )}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isSelected ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg"
                          />
                        </motion.button>
                      );
                    }
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="pt-6 border-t border-slate-200 space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    htmlFor="employee-designation"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Job Title / Designation
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="employee-designation"
                    type="text"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    placeholder="e.g., Support Specialist"
                    value={formData.jobTitle || ""}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-700">
                      {errors.jobTitle}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    htmlFor="employee-id-perm"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Employee ID
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="employee-id-perm"
                    type="text"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    placeholder="e.g., E123"
                    value={formData.employeeId || ""}
                    onChange={(e) =>
                      handleInputChange("employeeId", e.target.value)
                    }
                  />
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-700">
                      {errors.employeeId}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                    htmlFor="employee-password"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Set New Password
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="employee-password"
                    type="password"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    placeholder="Leave blank to keep unchanged"
                    autoComplete="new-password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-700">
                      {errors.password}
                    </p>
                  )}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                    className="text-xs text-slate-500 mt-2"
                  >
                    The employee will need to be informed of their new password
                    manually.
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="mt-8 flex justify-end gap-4"
            >
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.1 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgb(148 163 184)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-6 py-3 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.2 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.4)",
                  backgroundColor: "rgb(37 99 235)",
                }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
