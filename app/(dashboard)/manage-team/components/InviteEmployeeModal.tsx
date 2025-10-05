"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInviteEmployeeModalStore } from "@/app/(dashboard)/store/useInviteEmployeeModalStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { Department } from "@/lib/api/departments";
import {
  EmployeePermissionsEnum,
  EmployeeService,
} from "@/lib/api/v2/services/employee";
import api from "@/lib/api/v2/axios";
import apiOld from "@/lib/api";
import { SupervisorSummary } from "@/lib/api/v2/services/supervisor";
import { SupervisorService } from "@/lib/api/v2";
import InfoTooltip from "@/components/ui/InfoTooltip";

export default function InviteEmployeeModal() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    EmployeePermissionsEnum[]
  >([]);
  const [selectedSubDepartmentIds, setSelectedSubDepartmentIds] = useState<
    string[]
  >([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorSummary[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>("");
  const [supervisorSearchTerm, setSupervisorSearchTerm] = useState("");
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [userRole, setUserRole] = useState<string>("");

  const { addToast } = useToastStore();
  const {
    isOpen,
    invitationType,
    closeModal,
    isSubmitting,
    setIsSubmitting,
    resetForm,
  } = useInviteEmployeeModalStore();

  // Create EmployeeService instance
  const employeeService = EmployeeService.getInstance(api);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        apiOld.DepartmentsService.getAllDepartments().then(setDepartments),
        apiOld.DepartmentsService.getAllSubDepartments().then(
          setSubDepartments
        ),
        (async () => {
          const user = await fetch("/server/me").then(
            async (res) => (await res.json()).user
          );

          setUserRole(user.role);

          if (user.role === "ADMIN") {
            await SupervisorService.getSummaries().then(setSupervisors);
          }
        })(),
      ]);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSupervisorDropdown) {
        const target = event.target as Element;
        if (!target.closest(".supervisor-dropdown-container")) {
          setShowSupervisorDropdown(false);
          setMentionStartIndex(-1);
          setSupervisorSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSupervisorDropdown]);

  // Get all sub-departments grouped by department
  const subDepartmentsByDepartment = useMemo(() => {
    const grouped: { [key: string]: Department[] } = {};
    departments.forEach((dept) => {
      grouped[dept.id] = subDepartments.filter(
        (sd) => sd.parent?.id === dept.id
      );
    });
    return grouped;
  }, [departments, subDepartments]);

  // Filter supervisors based on search term
  const filteredSupervisors = useMemo(() => {
    if (!supervisorSearchTerm) return supervisors;
    const searchLower = supervisorSearchTerm.toLowerCase();
    return supervisors.filter(
      (supervisor) =>
        supervisor.name.toLowerCase().includes(searchLower) ||
        supervisor.username.toLowerCase().includes(searchLower)
    );
  }, [supervisors, supervisorSearchTerm]);

  const handleClose = () => {
    closeModal();
    resetForm();
    setEmail("");
    setFullName("");
    setJobTitle("");
    setEmployeeId("");
    setSelectedPermissions([]);
    setSelectedSubDepartmentIds([]);
    setSelectedSupervisorId("");
    setSupervisorSearchTerm("");
    setShowSupervisorDropdown(false);
    setMentionStartIndex(-1);
    setUserRole("");
  };

  const handlePermissionChange = (
    permission: EmployeePermissionsEnum,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permission]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== permission));
    }
  };

  const handleSubDepartmentChange = (subDeptId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubDepartmentIds((prev) => [...prev, subDeptId]);
    } else {
      setSelectedSubDepartmentIds((prev) =>
        prev.filter((id) => id !== subDeptId)
      );
    }
  };

  const handleSupervisorSelect = (supervisor: SupervisorSummary) => {
    setSelectedSupervisorId(supervisor.id);
    setSupervisorSearchTerm("");
    setShowSupervisorDropdown(false);
    setMentionStartIndex(-1);
  };

  const handleSupervisorRemove = () => {
    setSelectedSupervisorId("");
  };

  const handleSupervisorInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;

    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Only show dropdown if there's no space after @
      if (!textAfterAt.includes(" ")) {
        setSupervisorSearchTerm(textAfterAt);
        setShowSupervisorDropdown(true);
        setMentionStartIndex(lastAtIndex);
        return;
      }
    }

    setShowSupervisorDropdown(false);
    setMentionStartIndex(-1);
    setSupervisorSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !email ||
      !fullName ||
      !jobTitle ||
      selectedSubDepartmentIds.length === 0
    ) {
      addToast({
        message:
          "Please fill all required fields and select at least one sub-department.",
        type: "error",
      });
      return;
    }

    // Require supervisor selection for admins
    if (userRole === "ADMIN" && !selectedSupervisorId) {
      addToast({
        message: "Please select a supervisor for the new employee.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      email,
      fullName,
      jobTitle,
      employeeId: employeeId || undefined,
      permissions: selectedPermissions,
      subDepartmentIds: selectedSubDepartmentIds,
    };

    try {
      if (invitationType === "direct") {
        const response = await employeeService.createEmployeeDirect({
          ...requestData,
          supervisorUserId: selectedSupervisorId,
        });
        addToast({
          message: "Employee invited successfully!",
          type: "success",
        });
        console.log("Direct invitation response:", response);
      } else {
        const response = await employeeService.requestEmployeeInvitation(
          requestData
        );
        addToast({
          message: "Employee invitation request submitted successfully!",
          type: "success",
        });
        console.log("Invitation request response:", response);
      }

      handleClose();
    } catch (error) {
      console.error("Invitation error:", error);
      addToast({
        message: `Failed to ${
          invitationType === "direct" ? "invite" : "request invitation for"
        } employee`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    invitationType === "direct"
      ? "Invite Employee Directly"
      : "Request Employee Invitation";

  const submitButtonText =
    invitationType === "direct" ? "Send Invitation" : "Submit Request";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={handleClose}
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
              {modalTitle}
            </motion.h3>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Basic Information */}
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
                    htmlFor="employee-email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address *
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="employee-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    htmlFor="employee-fullname"
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
                    id="employee-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    required
                  />
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
                    htmlFor="employee-jobtitle"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Job Title *
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="employee-jobtitle"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    htmlFor="employee-id"
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
                    id="employee-id"
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                  />
                </div>
              </motion.div>

              {/* Sub-Departments Selection */}
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
                    Sub-Departments * (Select at least one)
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
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="space-y-4 max-h-64 overflow-y-auto"
                >
                  {departments.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                      className="text-center py-8 text-slate-500"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
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
                      Loading departments...
                    </motion.div>
                  ) : (
                    departments.map((dept, deptIndex) => {
                      const deptSubDepartments =
                        subDepartmentsByDepartment[dept.id] || [];
                      if (deptSubDepartments.length === 0) return null;

                      return (
                        <motion.div
                          key={dept.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.8 + deptIndex * 0.1,
                          }}
                          className="border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                        >
                          <motion.h4
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.9 + deptIndex * 0.1,
                            }}
                            className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                duration: 0.2,
                                delay: 1.0 + deptIndex * 0.1,
                              }}
                              className="w-2 h-2 bg-blue-500 rounded-full"
                            />
                            {dept.name}
                          </motion.h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {deptSubDepartments.map((subDept, subIndex) => {
                              const isSelected =
                                selectedSubDepartmentIds.includes(subDept.id);
                              return (
                                <motion.button
                                  key={subDept.id}
                                  type="button"
                                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay:
                                      1.1 + deptIndex * 0.1 + subIndex * 0.05,
                                    ease: "backOut",
                                  }}
                                  whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleSubDepartmentChange(
                                      subDept.id,
                                      !isSelected
                                    )
                                  }
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
                                      delay:
                                        1.2 + deptIndex * 0.1 + subIndex * 0.05,
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
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              </motion.div>

              {/* Permissions Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="block text-sm font-medium text-slate-700 mb-4"
                >
                  Permissions (Optional)
                </motion.label>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                >
                  {Object.values(EmployeePermissionsEnum).map(
                    (permission, index) => {
                      const isSelected =
                        selectedPermissions.includes(permission);
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
                            delay: 1.0 + index * 0.05,
                            ease: "backOut",
                          }}
                          whileHover={{
                            scale: 1.05,
                            y: -2,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handlePermissionChange(permission, !isSelected)
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
                              delay: 1.1 + index * 0.05,
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

              {/* Supervisor Selection */}
              {userRole === "ADMIN" && supervisors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <label className="text-sm font-medium text-slate-700">
                      Assign Supervisor *
                    </label>
                    <InfoTooltip
                      content="Required: Select a supervisor to oversee this employee's work and manage their tasks. Type @ to search by name or username."
                      position="top"
                      maxWidth="300px"
                      delay={200}
                    />
                  </motion.div>

                  {/* Selected Supervisor Display */}
                  {selectedSupervisorId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.0 }}
                      className="mb-4"
                    >
                      {(() => {
                        const supervisor = supervisors.find(
                          (s) => s.id === selectedSupervisorId
                        );
                        if (!supervisor) return null;

                        return (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 bg-blue-100 text-blue-800 px-4 py-3 rounded-xl text-sm border border-blue-200"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden">
                              {supervisor.profilePicture ? (
                                <img
                                  src={supervisor.profilePicture}
                                  alt={supervisor.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {supervisor.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {supervisor.name}
                              </div>
                              <div className="text-xs text-blue-600">
                                @{supervisor.username}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleSupervisorRemove}
                              className="hover:bg-blue-200 rounded-full p-1 transition-colors"
                            >
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </motion.div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* Supervisor Search Input */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                    className="relative supervisor-dropdown-container"
                  >
                    <motion.input
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.2 }}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                      }}
                      type="text"
                      placeholder="Type @ to search for a supervisor..."
                      onChange={handleSupervisorInputChange}
                      className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    />

                    {/* Supervisor Dropdown */}
                    {showSupervisorDropdown &&
                      filteredSupervisors.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto"
                        >
                          {filteredSupervisors.map((supervisor, index) => (
                            <motion.button
                              key={supervisor.username}
                              type="button"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                              }}
                              onClick={() => handleSupervisorSelect(supervisor)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {supervisor.profilePicture ? (
                                  <img
                                    src={supervisor.profilePicture}
                                    alt={supervisor.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-slate-600">
                                    {supervisor.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-slate-900">
                                  {supervisor.name}
                                </div>
                                <div className="text-sm text-slate-500">
                                  @{supervisor.username}
                                </div>
                              </div>
                              {selectedSupervisorId === supervisor.username && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                                >
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-8 flex justify-end gap-4"
            >
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgb(148 163 184)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.4)",
                  backgroundColor: "rgb(37 99 235)",
                }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : submitButtonText}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
