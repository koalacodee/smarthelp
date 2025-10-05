"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SupervisorEditModal from "./SupervisorEditModal";
import DelegateSupervisorModal from "./DelegateSupervisorModal";
import SupervisorsTable from "./SupervisorsTable";
import SupervisorsFilters from "./SupervisorsFilters";
import { useSupervisorStore } from "@/lib/store/useSupervisorStore";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { useSupervisorInvitationsStore } from "../store/useSupervisorInvitationsStore";
import { SupervisorsService } from "@/lib/api/index";
import { SupervisorInvitationStatus } from "@/lib/api/v2/services/supervisor";
import { env } from "next-runtime-env";
import { Datum as Supervisor } from "@/lib/api/supervisors";

interface SupervisorsPageClientProps {
  initialSupervisors: any[];
  initialInvitations: SupervisorInvitationStatus[];
  departments: any[];
}

// Utility function to get profile picture URL
const getProfilePictureUrl = (
  profilePicture: string | null | undefined
): string | null => {
  if (!profilePicture) return null;
  const baseUrl = env("NEXT_PUBLIC_API_URL");
  return `${baseUrl}/profile/pictures/${profilePicture}`;
};

export default function SupervisorsPageClient({
  initialSupervisors,
  initialInvitations,
  departments,
}: SupervisorsPageClientProps) {
  const { entities: supervisors, setEntities: setSupervisors } =
    useSupervisorStore();
  const { invitations, setInvitations } = useSupervisorInvitationsStore();
  const {
    setSupervisor,
    setIsEditing,
    isEditing,
    isDelegating,
    setIsDelegating,
  } = useCurrentEditingSupervisorStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Initialize with server data
  useEffect(() => {
    setSupervisors(initialSupervisors);
    setInvitations(initialInvitations);
  }, [initialSupervisors, setSupervisors, initialInvitations, setInvitations]);

  const refreshSupervisors = () => {
    SupervisorsService.getSupervisors()
      .then((data) => {
        setSupervisors(data);
      })
      .catch((error) => {
        console.error("Failed to fetch supervisors:", error);
      });
  };

  const filteredSupervisors = supervisors.filter((supervisor) => {
    // Enhanced search filter - search in all string properties
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      JSON.stringify(supervisor).toLowerCase().includes(searchLower) ||
      supervisor.user.username.toLowerCase().includes(searchLower) ||
      supervisor.user.name.toLowerCase().includes(searchLower) ||
      supervisor.user.email.toLowerCase().includes(searchLower) ||
      supervisor.user?.employeeId?.toLowerCase().includes(searchLower) ||
      supervisor.user?.jobTitle?.toLowerCase().includes(searchLower) ||
      supervisor.departments?.some((dept) =>
        dept.name.toLowerCase().includes(searchLower)
      ) ||
      supervisor.permissions?.some((permission) =>
        permission.toLowerCase().includes(searchLower)
      );

    // Department filter
    const matchesDepartment =
      !selectedDepartment ||
      supervisor.departments?.some((dept) => dept.id === selectedDepartment);

    return matchesSearch && matchesDepartment;
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
              Supervisor Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              Manage your team supervisors, permissions, and assignments with
              precision and ease
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.6,
                ease: "backOut",
              }}
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsEditing(true);
                setSupervisor(null);
              }}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <motion.svg
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </motion.svg>
              <span className="relative z-10">Invite New Supervisor</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-4 text-sm text-slate-500"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{supervisors.length} Active Supervisors</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span>{invitations.length} Pending Invitations</span>
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
          <SupervisorsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            departments={departments}
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
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
          >
            <SupervisorsTable supervisors={filteredSupervisors} />
          </motion.div>
        </motion.div>

        {/* Invitations Section */}
        {invitations.length > 0 && (
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
                Pending Invitations
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9, ease: "backOut" }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                >
                  {invitations.length}
                </motion.span>
              </motion.h4>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="space-y-4"
            >
              {invitations.map((invitation, index) => (
                <motion.div
                  key={invitation.token}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
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
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />

                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-6">
                      {/* Profile Picture - Using initials for invitations */}
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 1.1 + index * 0.1,
                          ease: "backOut",
                        }}
                        className="flex-shrink-0"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center text-slate-700 font-bold text-lg shadow-lg">
                          {invitation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      </motion.div>

                      <div className="flex-1">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 1.2 + index * 0.1,
                          }}
                        >
                          <p className="font-bold text-slate-900 text-lg">
                            {invitation.name}
                          </p>
                          <p className="text-slate-600 font-medium">
                            {invitation.email}
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 1.3 + index * 0.1,
                          }}
                          className="mt-2 text-sm text-slate-500 space-y-1"
                        >
                          <p>
                            <span className="font-semibold">Job Title:</span>{" "}
                            {invitation.jobTitle}
                          </p>
                          <p>
                            <span className="font-semibold">Departments:</span>{" "}
                            {invitation.departmentNames.join(", ")}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                    className="flex items-center gap-4 relative z-10"
                  >
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`px-4 py-2 text-sm font-bold rounded-xl shadow-lg ${
                        invitation.status === "pending"
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                          : invitation.status === "completed"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                          : "bg-gradient-to-r from-red-400 to-pink-500 text-white"
                      }`}
                    >
                      {invitation.status.toUpperCase()}
                    </motion.span>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 1.5 + index * 0.1 }}
                      className="text-right"
                    >
                      <p className="text-xs text-slate-500 font-medium">
                        Expires:
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      {isEditing && <SupervisorEditModal onSuccess={refreshSupervisors} />}
      {isDelegating && (
        <DelegateSupervisorModal
          isOpen={isDelegating}
          onClose={() => setIsDelegating(false)}
          onSuccess={refreshSupervisors}
        />
      )}
    </motion.div>
  );
}
