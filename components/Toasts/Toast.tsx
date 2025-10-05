"use client";

import { ToastMessage } from "@/app/(dashboard)/store/useToastStore";
import CheckCircle from "@/icons/CheckCircle";
import InfoCircle from "@/icons/InfoCircle";
import XCircle from "@/icons/XCircle";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: {
    Icon: CheckCircle,
    iconClass: "text-emerald-500",
    bgGradient: "from-emerald-50 to-green-50",
    borderColor: "border-emerald-200/50",
    iconBg: "bg-gradient-to-br from-emerald-100 to-green-100",
  },
  error: {
    Icon: XCircle,
    iconClass: "text-red-500",
    bgGradient: "from-red-50 to-rose-50",
    borderColor: "border-red-200/50",
    iconBg: "bg-gradient-to-br from-red-100 to-rose-100",
  },
  info: {
    Icon: InfoCircle,
    iconClass: "text-blue-500",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200/50",
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
  },
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => onDismiss(toast.id), 500); // Wait for animation to finish
      return () => clearTimeout(exitTimer);
    }, 4000); // 4 seconds before starting to exit

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
          x: 300,
          scale: 0.8,
          rotateY: 15,
        }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1,
          rotateY: 0,
        }}
        exit={{
          opacity: 0,
          x: 300,
          scale: 0.8,
          rotateY: -15,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.4,
        }}
        whileHover={{
          scale: 1.02,
          y: -2,
          transition: { duration: 0.2 },
        }}
        className={`max-w-sm w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border ${config.borderColor} pointer-events-auto overflow-hidden relative group`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {/* Background gradient overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} opacity-50`}
        />

        {/* Animated border glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.bgGradient} opacity-20 blur-sm -z-10`}
        />

        <div className="relative p-5">
          <div className="flex items-start gap-4">
            {/* Icon with animated background */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 },
              }}
              className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <config.Icon
                  className={`h-5 w-5 ${config.iconClass}`}
                  aria-hidden="true"
                />
              </motion.div>
            </motion.div>

            {/* Message content */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex-1 min-w-0 pt-1"
            >
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-sm font-semibold text-slate-800 leading-relaxed"
              >
                {toast.message}
              </motion.p>
            </motion.div>

            {/* Close button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex-shrink-0"
            >
              <motion.button
                onClick={handleDismiss}
                whileHover={{
                  scale: 1.1,
                  rotate: 90,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="sr-only">Close</span>
                <motion.svg
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 4, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.bgGradient} origin-left`}
        />
      </motion.div>
    </AnimatePresence>
  );
}
