"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeService } from "@/lib/api/v2";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";

interface InvitationRequestsListProps {
  invitationRequests: any[];
  userRole: string;
  onInvitationUpdate: (updatedRequests: any[]) => void;
}

export default function InvitationRequestsList({
  invitationRequests,
  userRole,
  onInvitationUpdate,
}: InvitationRequestsListProps) {
  const [loadingTokens, setLoadingTokens] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();

  const handleAcceptInvitation = async (token: string) => {
    setLoadingTokens((prev) => new Set(prev).add(token));

    try {
      const result = await EmployeeService.acceptEmployeeInvitationRequest(
        token
      );

      // Update the invitation requests list
      const updatedRequests = invitationRequests.map((request) =>
        request.token === token ? { ...request, status: "APPROVED" } : request
      );

      onInvitationUpdate(updatedRequests);

      addToast({
        type: "success",
        message: `Invitation for ${result.invitationDetails.fullName} has been approved successfully!`,
      });
    } catch (error: any) {
      console.error("Failed to accept invitation:", error);
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to accept invitation. Please try again.",
      });
    } finally {
      setLoadingTokens((prev) => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING_APPROVAL: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending Approval",
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.PENDING_APPROVAL;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex items-center gap-3 mb-6"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "backOut" }}
          className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
        >
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </motion.svg>
        </motion.div>
        <motion.h4
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-xl font-bold text-slate-800 flex items-center gap-2"
        >
          {userRole === "ADMIN"
            ? "Employee Invitation Requests"
            : "My Invitation Requests"}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.9, ease: "backOut" }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
          >
            {invitationRequests.length}
          </motion.span>
        </motion.h4>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {invitationRequests.map((request, index) => (
            <motion.div
              key={request.token}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: 1.0 + index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                y: -3,
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.3 },
              }}
              className="group relative flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50 p-6 rounded-2xl border border-slate-200/50 hover:border-orange-200 transition-all duration-300 overflow-hidden"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                    className="text-sm font-semibold text-slate-900"
                  >
                    {request.fullName}
                  </motion.h3>
                  {getStatusBadge(request.status)}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600"
                >
                  <div>
                    <span className="font-medium">Email:</span> {request.email}
                  </div>
                  <div>
                    <span className="font-medium">Job Title:</span>{" "}
                    {request.jobTitle}
                  </div>
                  {request.employeeId && (
                    <div>
                      <span className="font-medium">Employee ID:</span>{" "}
                      {request.employeeId}
                    </div>
                  )}
                  {userRole === "ADMIN" && request.supervisorName && (
                    <div>
                      <span className="font-medium">Supervisor:</span>{" "}
                      {request.supervisorName}
                    </div>
                  )}
                  {userRole === "SUPERVISOR" && request.subDepartmentNames && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Sub-Departments:</span>{" "}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.subDepartmentNames.map(
                          (dept: string, deptIndex: number) => (
                            <motion.span
                              key={deptIndex}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.3 + index * 0.1 + deptIndex * 0.05,
                                ease: "backOut",
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {dept}
                            </motion.span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {userRole === "ADMIN" &&
                request.status === "PENDING_APPROVAL" && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="ml-4"
                  >
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptInvitation(request.token)}
                      disabled={loadingTokens.has(request.token)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {loadingTokens.has(request.token) ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2"
                        >
                          <motion.svg
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </motion.svg>
                          <span>Accepting...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          Accept
                        </motion.span>
                      )}
                    </motion.button>
                  </motion.div>
                )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
