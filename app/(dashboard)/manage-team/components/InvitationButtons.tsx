import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInviteEmployeeModalStore } from "@/app/(dashboard)/store/useInviteEmployeeModalStore";

export default function InvitationButtons() {
  const [canInviteEmployeeDirectly, setCanInviteEmployeeDirectly] =
    useState(false);
  const { openModal } = useInviteEmployeeModalStore();

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user.role === "ADMIN") {
          return setCanInviteEmployeeDirectly(true);
        } else if (
          data.user.role === "SUPERVISOR" &&
          data.user.permissions.includes("MANAGE_STAFF_DIRECTLY")
        ) {
          return setCanInviteEmployeeDirectly(true);
        }
      });
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        {canInviteEmployeeDirectly ? (
          <motion.button
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
            onClick={() => openModal("direct")}
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
            <span className="relative z-10">Invite Employee Directly</span>
          </motion.button>
        ) : (
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
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal("request")}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl shadow-green-500/30 hover:shadow-3xl hover:shadow-green-500/40 transition-all duration-300 overflow-hidden"
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
            <span className="relative z-10">Request Employee Invitation</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
