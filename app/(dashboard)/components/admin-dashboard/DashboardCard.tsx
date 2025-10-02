"use client";

import React from "react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentClassName?: string;
  index?: number;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  accentClassName = "bg-blue-500",
  index = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
        className="p-5"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                delay: index * 0.1 + 0.3,
                duration: 0.4,
                ease: "backOut",
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-white text-slate-600 shadow-sm ring-1 ring-inset ring-white/40"
            >
              {icon}
            </motion.div>
          )}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
              className="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              {title}
            </motion.p>
            <div className="flex items-baseline gap-2">
              <motion.h3
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.1 + 0.5,
                  duration: 0.4,
                  ease: "backOut",
                }}
                className="text-2xl font-bold text-slate-800"
              >
                {value}
              </motion.h3>
              {subtitle && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.6, duration: 0.3 }}
                  className="text-xs font-medium text-slate-500"
                >
                  {subtitle}
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
