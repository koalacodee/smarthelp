"use client";

import { useEmployeesStore } from "@/app/(dashboard)/store/useEmployeesStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EmployeeActions from "./EmployeeActions";
import EditEmployeeModal from "./EditEmployeeModal";
import EmployeeFilters from "./EmployeeFilters";
import InviteEmployeeModal from "./InviteEmployeeModal";
import { EmployeeResponse } from "@/lib/api/v2/services/employee";
import { env } from "next-runtime-env";
import InvitationButtons from "./InvitationButtons";
import InvitationRequestsList from "./InvitationRequestsList";

export default function EmployeePageClient({
  initialEmployees,
  subDepartments = [],
  initialInvitationRequests = [],
  userRole,
}: {
  initialEmployees: EmployeeResponse[];
  subDepartments?: any[];
  initialInvitationRequests?: any[];
  userRole: string;
}) {
  const { employees, isLoading, error, setEmployees } = useEmployeesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [invitationRequests, setInvitationRequests] = useState(
    initialInvitationRequests
  );

  useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);

  // Enhanced search filter - search in all string properties
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      JSON.stringify(employee).toLowerCase().includes(searchLower) ||
      employee.user.username.toLowerCase().includes(searchLower) ||
      employee.user.name.toLowerCase().includes(searchLower) ||
      employee.user.email.toLowerCase().includes(searchLower) ||
      employee.user?.employeeId?.toLowerCase().includes(searchLower) ||
      employee.user?.jobTitle?.toLowerCase().includes(searchLower) ||
      employee.subDepartments?.some((dept) =>
        dept.name.toLowerCase().includes(searchLower)
      ) ||
      employee.permissions?.some((permission) =>
        permission.toLowerCase().includes(searchLower)
      );

    // Sub-Department filter
    const matchesSubDepartment =
      !selectedSubDepartment ||
      employee.subDepartments?.some(
        (dept) => dept.id === selectedSubDepartment
      );

    // Permission filter
    const matchesPermission =
      !selectedPermission ||
      employee.permissions?.some(
        (permission) => permission === selectedPermission
      );

    return matchesSearch && matchesSubDepartment && matchesPermission;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 relative overflow-hidden"
    >
      {/* Background Animation Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.7 }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.9 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-2xl"
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: "backOut",
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.3 },
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30"
          >
            <motion.svg
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </motion.svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: "easeOut",
              }}
              className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
            >
              Team Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              Grant or revoke sub-department access and specific abilities for
              employees on your team with precision and ease
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex items-center gap-4 text-sm text-slate-500"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{employees.length} Active Employees</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.3,
            ease: "easeOut",
          }}
          whileHover={{
            y: -2,
            transition: { duration: 0.3 },
          }}
        >
          <EmployeeFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSubDepartment={selectedSubDepartment}
            setSelectedSubDepartment={setSelectedSubDepartment}
            selectedPermission={selectedPermission}
            setSelectedPermission={setSelectedPermission}
            subDepartments={subDepartments}
          />
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: "easeOut",
          }}
          whileHover={{
            y: -3,
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/90  rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
          >
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <motion.thead
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gradient-to-r from-slate-50 to-blue-50/30"
                >
                  <tr>
                    {[
                      "Name",
                      "Designation",
                      "Sub-Departments",
                      "Permissions",
                      "Actions",
                    ].map((header, index) => (
                      <motion.th
                        key={header}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        scope="col"
                        className={`px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                          header === "Actions" ? "relative" : ""
                        }`}
                      >
                        {header === "Actions" ? (
                          <span className="sr-only">Actions</span>
                        ) : (
                          header
                        )}
                      </motion.th>
                    ))}
                  </tr>
                </motion.thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoading ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Loading employees...
                      </td>
                    </motion.tr>
                  ) : error ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-red-600"
                      >
                        {error}
                      </td>
                    </motion.tr>
                  ) : filteredEmployees.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <td colSpan={5} className="px-6 py-16">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="text-center"
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              duration: 0.8,
                              delay: 0.2,
                              ease: "backOut",
                            }}
                            className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 shadow-lg"
                          >
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.4, delay: 0.4 }}
                              className="h-10 w-10 text-slate-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </motion.svg>
                          </motion.div>
                          <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-xl font-bold text-slate-900 mb-2"
                          >
                            No employees found
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-slate-500 max-w-md mx-auto"
                          >
                            Get started by inviting new employees to your team.
                          </motion.p>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredEmployees.map((employee, index) => (
                      <motion.tr
                        key={employee.id}
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.3 + index * 0.08,
                          ease: "easeOut",
                        }}
                        className="group transition-all duration-200 hover:bg-slate-50"
                      >
                        <motion.td
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.4 + index * 0.08,
                          }}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <div className="flex items-center">
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: 0.5 + index * 0.08,
                                ease: "backOut",
                              }}
                              className="flex-shrink-0"
                            >
                              {employee.user.profilePicture ? (
                                <motion.img
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.6 + index * 0.08,
                                  }}
                                  src={`${env(
                                    "NEXT_PUBLIC_API_URL"
                                  )}/profile/pictures/${
                                    employee.user.profilePicture
                                  }`}
                                  alt={employee.user.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-600 font-medium text-sm shadow-lg">
                                          ${
                                            employee.user.name
                                              ? employee.user.name
                                                  .split(" ")
                                                  .map((n) => n[0])
                                                  .join("")
                                                  .toUpperCase()
                                              : employee.user.username
                                                  .split(" ")
                                                  .map((n) => n[0])
                                                  .join("")
                                                  .toUpperCase()
                                          }
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.6 + index * 0.08,
                                  }}
                                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-600 font-medium text-sm shadow-lg"
                                >
                                  {employee.user.name
                                    ? employee.user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                    : employee.user.username
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </motion.div>
                              )}
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.4,
                                delay: 0.7 + index * 0.08,
                              }}
                              className="ml-4"
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.8 + index * 0.08,
                                }}
                                className="text-sm font-semibold text-slate-900"
                              >
                                {employee.user.name}
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.9 + index * 0.08,
                                }}
                                className="text-sm text-slate-500"
                              >
                                @{employee.user.username}
                              </motion.div>
                            </motion.div>
                          </div>
                        </motion.td>
                        <motion.td
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.5 + index * 0.08,
                          }}
                          className="px-6 py-4 whitespace-nowrap text-sm text-slate-900"
                        >
                          <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.6 + index * 0.08,
                            }}
                            className="font-medium"
                          >
                            {employee.user.jobTitle || "Not specified"}
                          </motion.span>
                        </motion.td>
                        <motion.td
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.6 + index * 0.08,
                          }}
                          className="px-6 py-4 text-sm text-slate-500"
                        >
                          {employee.subDepartments.length > 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.7 + index * 0.08,
                              }}
                              className="flex flex-wrap gap-1"
                            >
                              {employee.subDepartments
                                .slice(0, 2)
                                .map((dept, deptIndex) => (
                                  <motion.span
                                    key={dept.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                      duration: 0.3,
                                      delay:
                                        0.8 + index * 0.08 + deptIndex * 0.1,
                                      ease: "backOut",
                                    }}
                                    className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-700 px-3 py-1 rounded-full font-medium shadow-sm"
                                  >
                                    {dept.name}
                                  </motion.span>
                                ))}
                              {employee.subDepartments.length > 2 && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.8 + index * 0.08 + 0.2,
                                    ease: "backOut",
                                  }}
                                  className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 px-3 py-1 rounded-full font-medium shadow-sm"
                                >
                                  +{employee.subDepartments.length - 2}
                                </motion.span>
                              )}
                            </motion.div>
                          ) : (
                            <motion.span
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.7 + index * 0.08,
                              }}
                              className="text-sm text-slate-400 italic"
                            >
                              None
                            </motion.span>
                          )}
                        </motion.td>
                        <motion.td
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.7 + index * 0.08,
                          }}
                          className="px-6 py-4 text-sm text-slate-500"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.8 + index * 0.08,
                            }}
                            className="flex flex-wrap gap-1"
                          >
                            {employee.permissions.length > 0 ? (
                              employee.permissions
                                .slice(0, 2)
                                .map((permission, permIndex) => (
                                  <motion.span
                                    key={permission}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                      duration: 0.3,
                                      delay:
                                        0.9 + index * 0.08 + permIndex * 0.1,
                                      ease: "backOut",
                                    }}
                                    className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-slate-700 px-3 py-1 rounded-full font-medium shadow-sm"
                                  >
                                    {permission
                                      .replace(/_/g, " ")
                                      .toLowerCase()
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </motion.span>
                                ))
                            ) : (
                              <motion.span
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.8 + index * 0.08,
                                }}
                                className="text-sm text-slate-400 italic"
                              >
                                None
                              </motion.span>
                            )}
                            {employee.permissions.length > 2 && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.9 + index * 0.08 + 0.2,
                                  ease: "backOut",
                                }}
                                className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 px-3 py-1 rounded-full font-medium shadow-sm"
                              >
                                +{employee.permissions.length - 2}
                              </motion.span>
                            )}
                          </motion.div>
                        </motion.td>
                        <motion.td
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.8 + index * 0.08,
                          }}
                          className="px-6 py-4 text-right text-sm font-medium"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.9 + index * 0.08,
                            }}
                          >
                            <EmployeeActions employee={employee} />
                          </motion.div>
                        </motion.td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>

        {/* Invitation Requests Section */}
        {invitationRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: "easeOut",
            }}
            whileHover={{
              y: -2,
              transition: { duration: 0.3 },
            }}
          >
            <InvitationRequestsList
              invitationRequests={invitationRequests}
              userRole={userRole}
              onInvitationUpdate={setInvitationRequests}
            />
          </motion.div>
        )}
      </div>

      <EditEmployeeModal />
      <InviteEmployeeModal />
      <InvitationButtons />
    </motion.div>
  );
}
