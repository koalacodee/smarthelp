"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { SupervisorService } from "@/lib/api/v2";
import { SupervisorSummary } from "@/lib/api/v2/services/supervisor";
import { env } from "next-runtime-env";
import useFormErrors from "@/hooks/useFormErrors";

interface DelegateSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Utility function to get profile picture URL
const getProfilePictureUrl = (
  profilePicture: string | null | undefined
): string | null => {
  if (!profilePicture) return null;
  const baseUrl = env("NEXT_PUBLIC_API_URL");
  return `${baseUrl}/profile/pictures/${profilePicture}`;
};

export default function DelegateSupervisorModal({
  isOpen,
  onClose,
  onSuccess,
}: DelegateSupervisorModalProps) {
  const { clearErrors, setRootError, errors } = useFormErrors([
    // no field-specific errors needed; root only
  ]);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<SupervisorSummary | null>(null);
  const [supervisors, setSupervisors] = useState<SupervisorSummary[]>([]);
  const [supervisorSearchTerm, setSupervisorSearchTerm] = useState("");
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToastStore();
  const { supervisor: currentSupervisor } = useCurrentEditingSupervisorStore();

  useEffect(() => {
    if (isOpen && currentSupervisor) {
      // Fetch available supervisors (excluding the current one)
      const fetchSupervisors = async () => {
        try {
          const data = await SupervisorService.getSummaries();
          // Filter out the current supervisor
          const filteredSupervisors = data.filter(
            (s) => s.id !== currentSupervisor.id
          );
          setSupervisors(filteredSupervisors);
        } catch (error) {
          console.error("Failed to fetch supervisors:", error);
          addToast({
            message: "Failed to load supervisors",
            type: "error",
          });
        }
      };
      fetchSupervisors();
    }
  }, [isOpen, currentSupervisor, addToast]);

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

  // Filter supervisors based on search term
  const filteredSupervisors = supervisors.filter(
    (supervisor) =>
      supervisor.name
        .toLowerCase()
        .includes(supervisorSearchTerm.toLowerCase()) ||
      supervisor.username
        .toLowerCase()
        .includes(supervisorSearchTerm.toLowerCase())
  );

  const handleClose = () => {
    clearErrors();
    setSelectedSupervisor(null);
    setSupervisorSearchTerm("");
    setShowSupervisorDropdown(false);
    setMentionStartIndex(-1);
    onClose();
  };

  const handleSupervisorSelect = (supervisor: SupervisorSummary) => {
    setSelectedSupervisor(supervisor);
    setSupervisorSearchTerm("");
    setShowSupervisorDropdown(false);
    setMentionStartIndex(-1);
  };

  const handleSupervisorRemove = () => {
    setSelectedSupervisor(null);
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

  const handleDelegate = async () => {
    if (!currentSupervisor || !selectedSupervisor) {
      setRootError("Please select a supervisor to delegate to.");
      return;
    }

    clearErrors();
    setIsSubmitting(true);
    try {
      await SupervisorService.delegate({
        fromSupervisorUserId: currentSupervisor.userId,
        toSupervisorUserId: selectedSupervisor.id,
      });

      addToast({
        message: `Successfully delegated supervisor responsibilities from ${currentSupervisor.user.username} to ${selectedSupervisor.username}`,
        type: "success",
      });

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Delegate supervisor error:", error);
      setRootError(
        error?.response?.data?.message ||
          "Failed to delegate supervisor. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !currentSupervisor) return null;

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
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
          >
            Delegate Supervisor
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
            className="space-y-8"
          >
            {/* Current Supervisor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg"
                >
                  {currentSupervisor.user.profilePicture ? (
                    <img
                      src={
                        getProfilePictureUrl(
                          currentSupervisor.user.profilePicture
                        ) || ""
                      }
                      alt={currentSupervisor.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                      {currentSupervisor.user.name
                        ? currentSupervisor.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : currentSupervisor.user.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                    </div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="mt-3 text-center"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {currentSupervisor.user.name ||
                      currentSupervisor.user.username}
                  </div>
                  <div className="text-xs text-slate-500">
                    @{currentSupervisor.user.username}
                  </div>
                </motion.div>
              </div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="flex-1 flex justify-center"
              >
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full relative">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-indigo-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"
                  />
                </div>
              </motion.div>

              {/* Target Supervisor */}
              <div className="flex flex-col items-center">
                {selectedSupervisor ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-200 shadow-lg"
                    >
                      {selectedSupervisor.profilePicture ? (
                        <img
                          src={
                            getProfilePictureUrl(
                              selectedSupervisor.profilePicture
                            ) || ""
                          }
                          alt={selectedSupervisor.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                          {selectedSupervisor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="mt-3 text-center"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {selectedSupervisor.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        @{selectedSupervisor.username}
                      </div>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                      onClick={handleSupervisorRemove}
                      className="mt-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-red-500"
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
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    onClick={() => setShowSupervisorDropdown(true)}
                    className="w-20 h-20 rounded-full border-4 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center transition-colors group"
                  >
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="w-8 h-8 text-slate-400 group-hover:text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </motion.svg>
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Supervisor Search Input */}
            {!selectedSupervisor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="relative supervisor-dropdown-container"
              >
                <motion.input
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
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
                {showSupervisorDropdown && filteredSupervisors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto"
                  >
                    {filteredSupervisors.map((supervisor, index) => (
                      <motion.button
                        key={supervisor.id}
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
                              src={
                                getProfilePictureUrl(
                                  supervisor.profilePicture
                                ) || ""
                              }
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
                      </motion.button>
                    ))}
                  </motion.div>
                )}
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
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 20px -5px rgba(34, 197, 94, 0.4)",
                backgroundColor: "rgb(34 197 94)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelegate}
              disabled={!selectedSupervisor || isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Delegating..." : "Delegate"}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
