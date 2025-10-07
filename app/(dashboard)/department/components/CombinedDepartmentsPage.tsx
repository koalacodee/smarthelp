"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AddDepartmentButton from "./AddDepartmentButton";
import DepartmentActions from "./DepartmentActions";
import DepartmentEditingModal from "./DepartmentEditingModal";
import CreateSubDepartmentModal from "@/app/(dashboard)/sub-departments/components/CreateSubDepartmentModal";
import SubDepartmentActions from "@/app/(dashboard)/sub-departments/components/SubDepartmentActions";
import EditSubDepartmentModal from "@/app/(dashboard)/sub-departments/components/EditSubDepartmentModal";
import { Department as APIDepartment } from "@/lib/api/departments";
import api from "@/lib/api";
import { useSubDepartmentsStore } from "@/app/(dashboard)/store/useSubDepartmentsStore";
import { useCreateSubDepartmentStore } from "@/app/(dashboard)/store/useCreateSubDepartmentStore";
import RefreshButton from "@/components/ui/RefreshButton";

interface CombinedDepartmentsPageProps {
  departments: APIDepartment[];
}

export default function CombinedDepartmentsPage({
  departments,
}: CombinedDepartmentsPageProps) {
  const {
    subDepartments,
    isLoading,
    error,
    setSubDepartments,
    setLoading,
    setError,
  } = useSubDepartmentsStore();
  const [localDepartments] = useState<APIDepartment[]>(departments);
  const { openModal: openCreateSubDepartment } = useCreateSubDepartmentStore();

  useEffect(() => {
    const fetchSubDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        const subDepartmentsData =
          await api.DepartmentsService.getAllSubDepartments();
        setSubDepartments(subDepartmentsData);
      } catch (err) {
        setError("Failed to fetch sub-departments");
      } finally {
        setLoading(false);
      }
    };

    fetchSubDepartments();
  }, [setSubDepartments, setLoading, setError]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
              Departments & Sub-departments
            </h1>
            <p className="text-slate-600 mt-1">
              Manage main categories and their sections in one unified view.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {/* Departments table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Departments
                  </h2>
                  <p className="text-xs text-slate-600">
                    Manage your main categories
                  </p>
                </div>
              </div>
              <RefreshButton
                onRefresh={async () => {
                  // Optionally implement reload if departments can change elsewhere
                }}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <tbody className="bg-white divide-y divide-slate-200">
                  {localDepartments.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-slate-500">
                        No departments found
                      </td>
                    </tr>
                  ) : (
                    localDepartments.map((department) => (
                      <tr
                        key={department.id}
                        className="group hover:bg-slate-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {department.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {department.visibility}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="opacity-100">
                            <DepartmentActions department={department} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Sub-departments table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Sub-departments
                  </h3>
                  <p className="text-xs text-slate-600">Manage your sections</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-slate-500">
                        Loading sub-departments...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : subDepartments.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-slate-500">
                        No sub-departments found
                      </td>
                    </tr>
                  ) : (
                    subDepartments.map((subDepartment) => (
                      <tr
                        key={subDepartment.id}
                        className="group hover:bg-slate-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {subDepartment.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Under Category:{" "}
                                {subDepartment.parent?.name || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="opacity-100">
                            <SubDepartmentActions
                              subDepartment={subDepartment}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Modals */}
        <DepartmentEditingModal />
        <EditSubDepartmentModal />
        <CreateSubDepartmentModal />
      </div>
      <AddDepartmentButton />
    </motion.div>
  );
}
