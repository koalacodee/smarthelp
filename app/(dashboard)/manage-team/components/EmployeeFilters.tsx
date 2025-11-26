"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useEmployeesStore } from "@/app/(dashboard)/store/useEmployeesStore";
import { EmployeeResponse } from "@/lib/api/v2/services/employee";

interface EmployeeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSubDepartment: string;
  setSelectedSubDepartment: (dept: string) => void;
  selectedPermission: string;
  setSelectedPermission: (permission: string) => void;
  subDepartments: any[];
}

export default function EmployeeFilters({
  searchTerm,
  setSearchTerm,
  selectedSubDepartment,
  setSelectedSubDepartment,
  selectedPermission,
  setSelectedPermission,
  subDepartments,
}: EmployeeFiltersProps) {
  const { employees } = useEmployeesStore();

  // Get unique permissions for filter dropdown
  const permissions = useMemo(() => {
    const permissionSet = new Set<string>();
    employees.forEach((employee) => {
      employee.permissions?.forEach((permission) => {
        permissionSet.add(permission);
      });
    });
    return Array.from(permissionSet).sort();
  }, [employees]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubDepartment("");
    setSelectedPermission("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/90  rounded-xl shadow-lg border border-white/20 p-4 mb-6"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative flex-1 min-w-0"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.div>
          <motion.input
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
            placeholder="Search in all employee properties..."
          />
        </motion.div>

        {/* Sub-Department Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="relative w-full sm:w-auto sm:min-w-[200px]"
        >
          <motion.select
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileFocus={{ scale: 1.02 }}
            value={selectedSubDepartment}
            onChange={(e) => setSelectedSubDepartment(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer pr-8"
          >
            <option value="">Select Sub-Department</option>
            {subDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </motion.select>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.6 }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
          >
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Permission Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="relative w-full sm:w-auto sm:min-w-[200px]"
        >
          <motion.select
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            whileFocus={{ scale: 1.02 }}
            value={selectedPermission}
            onChange={(e) => setSelectedPermission(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer pr-8"
          >
            <option value="">Select Permission</option>
            {permissions.map((permission) => (
              <option key={permission} value={permission}>
                {permission
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </motion.select>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.7 }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
          >
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Search Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </motion.button>

        {/* Clear Filters Button */}
        {(searchTerm || selectedSubDepartment || selectedPermission) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100 rounded-lg flex items-center gap-2"
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
            Clear
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
