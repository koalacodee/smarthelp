"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SupervisorPermissions } from "@/lib/api/supervisors";
import { DepartmentsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { useSupervisorsStore } from "../store/useSupervisorsStore";
import { useSupervisorInvitationsStore } from "../store/useSupervisorInvitationsStore";
import { Department } from "@/lib/api/departments";
import { SupervisorService } from "@/lib/api/v2";
import InfoTooltip from "@/components/ui/InfoTooltip";
import useFormErrors from "@/hooks/useFormErrors";

interface SupervisorEditModalProps {
  onSuccess?: () => void;
}

export default function SupervisorEditModal({
  onSuccess,
}: SupervisorEditModalProps) {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "name",
    "email",
    "jobTitle",
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [permissions, setPermissions] = useState<SupervisorPermissions[]>([]);
  const [assignedCategories, setAssignedCategories] = useState<string[]>([]);
  const { addToast } = useToastStore();
  const { supervisor, isEditing, setIsEditing } =
    useCurrentEditingSupervisorStore();
  const { addSupervisor, updateSupervisor } = useSupervisorsStore();
  const { addInvitation } = useSupervisorInvitationsStore();
  const [departments, setDepartments] = useState<Department[]>([]);

  const permissionOptions = Object.values(SupervisorPermissions);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await DepartmentsService.getAllDepartments();
        setDepartments(response);
      } catch (error) { }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (supervisor) {
      setName((supervisor.user as any).name || supervisor.user.username || "");
      setEmail(supervisor.user.email || "");
      setEmployeeId(supervisor.user.employeeId || "");
      setJobTitle(supervisor.user.jobTitle || "");
      setPermissions(supervisor.permissions || []);
      setAssignedCategories(supervisor.departments.map(({ id }) => id) || []);
    } else {
      setName("");
      setEmail("");
      setEmployeeId("");
      setPermissions([]);
      setAssignedCategories([]);
      setJobTitle("");
    }
  }, [supervisor]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!name || !email || !jobTitle) {
      setRootError("Please fill all required fields");
      return;
    }

    const supervisorData = {
      name: name,
      email: email,
      permissions: permissions,
      departmentIds: assignedCategories,
      jobTitle: jobTitle,
      employeeId: employeeId || undefined,
    };

    try {
      if (supervisor) {
        const response = await SupervisorService.update(supervisor.id, {
          name: name,
          email: email,
          permissions: permissions,
          departmentIds: assignedCategories,
          jobTitle: jobTitle,
          employeeId: !!employeeId ? employeeId : undefined,
        });
        updateSupervisor(supervisor.id, response);
        addToast({
          message: "Invitation details updated successfully",
          type: "success",
        });
      } else {
        const response = await SupervisorService.addByAdmin(supervisorData);
        addInvitation(response.invitation);
        addToast({
          message: "Supervisor invitation sent successfully",
          type: "success",
        });
      }
      setIsEditing(false);
      onSuccess?.();
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
          "Operation failed. Please try again."
        );
      }
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

  const modalTitle = supervisor
    ? "Edit Supervisor Invitation"
    : "Invite New Supervisor via Email";

  if (!isEditing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={() => setIsEditing(false)}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSave}>
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
            >
              {modalTitle}
            </motion.h3>

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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <div>
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    htmlFor="user-name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Full Name *
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="user-name"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-700">{errors.name}</p>
                  )}
                </div>
                <div>
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    htmlFor="user-email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email to Invite *
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="user-email"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-700">{errors.email}</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <div>
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    htmlFor="user-employee-id"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Employee ID (Optional)
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="user-employee-id"
                    placeholder="e.g., A123"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
                <div>
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    htmlFor="user-designation"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Job Title / Designation *
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="user-designation"
                    placeholder="e.g., Shipping Supervisor"
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-700">
                      {errors.jobTitle}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <label className="text-sm font-medium text-slate-700">
                    Assign Departments
                  </label>
                  <InfoTooltip
                    content="Select departments that this supervisor will manage. Multiple selections allowed for cross-departmental supervision."
                    position="top"
                    maxWidth="300px"
                    delay={100}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                >
                  {departments.map((department, index) => {
                    const isSelected = assignedCategories.includes(
                      department.id
                    );
                    return (
                      <motion.button
                        key={department.id}
                        type="button"
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
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
                        onClick={() => toggleCategory(department.id)}
                        className={`
                          relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isSelected
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
                            delay: 0.9 + index * 0.05,
                          }}
                          className="relative z-10"
                        >
                          {department.name}
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
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="block text-sm font-medium text-slate-700 mb-4"
                >
                  Choose Permissions
                </motion.label>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                >
                  {permissionOptions.map((permission, index) => {
                    const isSelected = permissions.includes(permission);
                    const permissionLabel = permission == "MANAGE_ATTACHMENT_GROUPS" ? "Manage TV Content" : permission
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
                          delay: 0.9 + index * 0.05,
                          ease: "backOut",
                        }}
                        whileHover={{
                          scale: 1.05,
                          y: -2,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => togglePermission(permission)}
                        className={`
                          relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${isSelected
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
                            delay: 1.0 + index * 0.05,
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
                  })}
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
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {supervisor ? "Save Changes" : "Send Invitation"}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
