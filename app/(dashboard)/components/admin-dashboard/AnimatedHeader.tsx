"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function AnimatedHeader() {
  const { locale } = useLocaleStore();

  if (!locale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl"
    >
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10"
      />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl "
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-3xl font-bold text-transparent"
            >
              {locale.dashboard.admin.header.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-slate-600"
            >
              {locale.dashboard.admin.header.description}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
