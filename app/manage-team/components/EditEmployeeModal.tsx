import React, { useEffect, useState } from "react";
import { useEditEmployeeStore } from "@/app/store/useEditEmployeeStore";
import { useToastStore } from "@/app/store/useToastStore";
import { useEmployeesStore } from "@/app/store/useEmployeesStore";
import api from "@/lib/api";
import { EmployeePermissions } from "@/lib/api/types";

export default function EditEmployeeModal() {
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
  const { setEmployees } = useEmployeesStore();
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
        console.error("Failed to fetch sub-departments:", error);
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

    setIsSubmitting(true);
    try {
      const response = await api.EmployeeService.updateEmployee(
        currentEmployee.id,
        formData
      );

      // Update the employees list in the store
      const updatedEmployees = await api.EmployeeService.getAllEmployees();
      setEmployees(updatedEmployees);

      addToast({ message: "Employee updated successfully", type: "success" });
      closeModal();
    } catch (error) {
      addToast({ message: "Failed to update employee", type: "error" });
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

  return (
    <>
      {isOpen && currentEmployee && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-2 text-slate-800">
              Manage Permissions
            </h3>
            <p className="text-slate-600 mb-6">
              for{" "}
              <span className="font-semibold">
                {currentEmployee.user.username}
              </span>
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assigned Sub-departments
                </label>
                <div className="space-y-2">
                  {isLoadingSubDepartments ? (
                    <div className="text-sm text-slate-500">
                      Loading sub-departments...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {subDepartments.map((subDept) => (
                        <div key={subDept.id} className="flex items-center">
                          <input
                            id={`sub-dept-${subDept.id}`}
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            checked={
                              formData.subDepartmentIds?.includes(subDept.id) ||
                              false
                            }
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const currentSubDeptIds =
                                formData.subDepartmentIds || [];

                              setFormData({
                                ...formData,
                                subDepartmentIds: isChecked
                                  ? [...currentSubDeptIds, subDept.id]
                                  : currentSubDeptIds.filter(
                                      (subDeptId: string) =>
                                        subDeptId !== subDept.id
                                    ),
                              });
                            }}
                          />
                          <label
                            htmlFor={`sub-dept-${subDept.id}`}
                            className="ml-2 text-sm text-slate-700"
                          >
                            {subDept.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Granted Abilities
                </label>
                <div className="space-y-3 p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="perm-ability-handle_tickets"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      checked={
                        formData.permissions?.includes(
                          EmployeePermissions.HANDLE_TICKETS
                        ) || false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "permissions",
                          EmployeePermissions.HANDLE_TICKETS,
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor="perm-ability-handle_tickets"
                      className="ml-2 text-sm text-slate-700"
                    >
                      Handle Tickets & Complaints
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm-ability-handle_tasks"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      checked={
                        formData.permissions?.includes(
                          EmployeePermissions.HANDLE_TASKS
                        ) || false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "permissions",
                          EmployeePermissions.HANDLE_TASKS,
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor="perm-ability-handle_tasks"
                      className="ml-2 text-sm text-slate-700"
                    >
                      Handle Assigned Tasks
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm-ability-add_faqs"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      checked={
                        formData.permissions?.includes(
                          EmployeePermissions.ADD_FAQS
                        ) || false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "permissions",
                          EmployeePermissions.ADD_FAQS,
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor="perm-ability-add_faqs"
                      className="ml-2 text-sm text-slate-700"
                    >
                      Add FAQs
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm-ability-view_analytics"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      checked={
                        formData.permissions?.includes(
                          EmployeePermissions.VIEW_ANALYTICS
                        ) || false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "permissions",
                          EmployeePermissions.VIEW_ANALYTICS,
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor="perm-ability-view_analytics"
                      className="ml-2 text-sm text-slate-700"
                    >
                      View Analytics Dashboard
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm-ability-close_tickets"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      checked={
                        formData.permissions?.includes(
                          EmployeePermissions.CLOSE_TICKETS
                        ) || false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "permissions",
                          EmployeePermissions.CLOSE_TICKETS,
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor="perm-ability-close_tickets"
                      className="ml-2 text-sm text-slate-700"
                    >
                      Close Answered Tickets
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div>
                  <label
                    htmlFor="employee-designation"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Job Title / Designation
                  </label>
                  <input
                    id="employee-designation"
                    type="text"
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Support Specialist"
                    value={formData.jobTitle || ""}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="employee-id-perm"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Employee ID
                  </label>
                  <input
                    id="employee-id-perm"
                    type="text"
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., E123"
                    value={formData.employeeId || ""}
                    onChange={(e) =>
                      handleInputChange("employeeId", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="employee-password"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Set New Password
                  </label>
                  <input
                    id="employee-password"
                    type="password"
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave blank to keep unchanged"
                    autoComplete="new-password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    The employee will need to be informed of their new password
                    manually.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
