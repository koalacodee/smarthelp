"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PermissionDenied() {

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-lg mx-auto"
      >
        {/* Gradient border card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 p-[2px] shadow-2xl">
          <div className="h-full w-full rounded-2xl bg-white/95 backdrop-blur-sm">
            <div className="p-8 sm:p-10">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: "backOut",
                }}
                className="relative mb-6 flex justify-center"
              >
                <div className="relative">
                  {/* Outer glow ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-orange-500 blur-xl"
                  />
                  {/* Icon container */}
                  <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center shadow-lg ring-4 ring-red-100/50">
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.4,
                        ease: "easeOut",
                      }}
                      className="w-12 h-12 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </motion.svg>
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl sm:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 bg-clip-text text-transparent"
              >
                Access Denied
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center text-slate-600 mb-8 text-base sm:text-lg"
              >
                You don't have permission to access this page.
              </motion.p>

              {/* Help text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center text-sm text-slate-500"
              >
                Please contact your administrator if you believe this is an error.
              </motion.p>

              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl -z-10"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full blur-2xl -z-10"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

