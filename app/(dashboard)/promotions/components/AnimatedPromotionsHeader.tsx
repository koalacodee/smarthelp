"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function AnimatedPromotionsHeader() {
  const { locale } = useLocaleStore();

  if (!locale) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl"
    >
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10"
      />
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl "
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-indigo-800 bg-clip-text text-transparent"
            >
              {locale.promotions.pageHeader.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-slate-600 text-lg"
            >
              {locale.promotions.pageHeader.description}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
