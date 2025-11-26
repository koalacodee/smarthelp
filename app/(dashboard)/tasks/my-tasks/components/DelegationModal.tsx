"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskDelegationService } from "@/lib/api/v2";
import { EmployeeResponse } from "@/lib/api/v2/services/employee";
import { Department } from "@/lib/api/departments";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { env } from "next-runtime-env";

interface DelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

export default function DelegationModal({
  isOpen,
  onClose,
  taskId,
}: DelegationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Check if query starts with @
    if (searchQuery.startsWith("@")) {
      const query = searchQuery.slice(1).trim();

      if (query.length > 0) {
        // Debounce the search
        debounceTimerRef.current = setTimeout(async () => {
          setIsLoading(true);
          try {
            const response = await TaskDelegationService.getDelegables(query);
            setEmployees(response.employees || []);
            setSubDepartments(response.subDepartments || []);
            setShowResults(true);
          } catch (error) {
            console.error("Error fetching delegables:", error);
            addToast({
              message: "Failed to load employees and departments",
              type: "error",
            });
          } finally {
            setIsLoading(false);
          }
        }, 300); // 300ms debounce
      } else {
        setEmployees([]);
        setSubDepartments([]);
        setShowResults(false);
      }
    } else {
      setEmployees([]);
      setSubDepartments([]);
      setShowResults(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, addToast]);

  const handleSelect = async (
    type: "employee" | "subDepartment",
    id: string
  ) => {
    try {
      setIsLoading(true);
      if (type === "employee") {
        await TaskDelegationService.delegateTask({
          taskId,
          assigneeId: id,
        });
      } else {
        await TaskDelegationService.delegateTask({
          taskId,
          targetSubDepartmentId: id,
        });
      }

      addToast({
        message: `Task successfully assigned to ${
          type === "employee" ? "employee" : "sub-department"
        }`,
        type: "success",
      });

      // Reset and close
      setSearchQuery("");
      setEmployees([]);
      setSubDepartments([]);
      setShowResults(false);
      onClose();
    } catch (error) {
      console.error("Error delegating task:", error);
      addToast({
        message: "Failed to assign task",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setEmployees([]);
    setSubDepartments([]);
    setShowResults(false);
    setFailedImages(new Set());
    onClose();
  };

  const getInitials = (name: string, username: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : username
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Assign to Employee/Sub-Department
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>

          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type @ to search for employees or sub-departments"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showResults &&
              (employees.length > 0 || subDepartments.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg"
                >
                  {/* Employees */}
                  {employees.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                        Employees
                      </div>
                      {employees.map((employee) => (
                        <motion.button
                          key={employee.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleSelect("employee", employee.id)}
                          disabled={isLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {employee.user.profilePicture &&
                          !failedImages.has(employee.id) ? (
                            <img
                              src={`${env(
                                "NEXT_PUBLIC_API_URL"
                              )}/profile/pictures/${
                                employee.user.profilePicture
                              }`}
                              alt={employee.user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              onError={() => {
                                setFailedImages((prev) =>
                                  new Set(prev).add(employee.id)
                                );
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-600 font-medium text-sm border-2 border-gray-200">
                              {getInitials(
                                employee.user.name,
                                employee.user.username
                              )}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900">
                              {employee.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{employee.user.username}
                              {employee.user.jobTitle &&
                                ` • ${employee.user.jobTitle}`}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Sub-Departments */}
                  {subDepartments.length > 0 && (
                    <div className="p-2 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                        Sub-Departments
                      </div>
                      {subDepartments.map((dept) => (
                        <motion.button
                          key={dept.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleSelect("subDepartment", dept.id)}
                          disabled={isLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-gray-200">
                            <svg
                              className="w-5 h-5 text-purple-600"
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
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900">
                              {dept.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Sub-Department
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
          </AnimatePresence>

          {showResults &&
            employees.length === 0 &&
            subDepartments.length === 0 &&
            !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No results found
              </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
