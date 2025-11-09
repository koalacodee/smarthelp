"use client";

import { motion } from "framer-motion";
import { useCurrentEditingDepartment } from "@/app/(dashboard)/department/store/useCurrentEditingDepartment";
import { useCreateSubDepartmentStore } from "@/app/(dashboard)/store/useCreateSubDepartmentStore";

export default function AddDepartmentButton({ userRole }: { userRole: string }) {
  if (userRole == "EMPLOYEE") {
    return null;
  }
  const { openModal: openDepartmentModal } = useCurrentEditingDepartment();
  const { openModal: openCreateSubDepartment } = useCreateSubDepartmentStore();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-row gap-4 items-end"
      >
        {userRole === "ADMIN" && <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.7,
            ease: "backOut",
          }}
          whileHover={{
            scale: 1.05,
            y: -2,
            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openDepartmentModal("add", null)}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          <svg
            className="w-4 h-4 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="relative z-10">Add Department</span>
        </motion.button>}

        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.8,
            ease: "backOut",
          }}
          whileHover={{
            scale: 1.05,
            y: -2,
            boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateSubDepartment}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          <svg
            className="w-4 h-4 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="relative z-10">Add Sub-department</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
