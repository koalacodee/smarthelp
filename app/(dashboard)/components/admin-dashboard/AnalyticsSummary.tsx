"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface KPIItem {
  label: string;
  value: string;
}

interface DepartmentPerfItem {
  name: string;
  score: number; // 0-100
}

interface AnalyticsSummaryProps {
  kpis: KPIItem[];
  departmentPerformance: DepartmentPerfItem[];
}

export default function AnalyticsSummary({
  kpis,
  departmentPerformance,
}: AnalyticsSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl p-5"
    >
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1 }}
        className="mb-4 text-base font-semibold text-slate-800"
      >
        Analytics Summary
      </motion.h3>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="col-span-2 space-y-3">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <span className="text-sm font-medium text-slate-600">
                {kpi.label}
              </span>
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.4 + index * 0.1 }}
                className="text-sm font-semibold text-slate-800"
              >
                {kpi.value}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col space-y-3">
          <AnimatePresence mode="wait">
            {departmentPerformance
              .slice(0, expanded ? departmentPerformance.length : 6)
              .map((d, index) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 1.6 + index * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">{d.name}</span>
                    <span className="font-semibold text-slate-800">
                      {d.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${d.score}%` }}
                      transition={{
                        duration: 1,
                        delay: 1.8 + index * 0.05,
                        ease: "easeOut",
                      }}
                      className="h-2 rounded-full bg-indigo-500"
                    />
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
          {departmentPerformance.length > 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 2 }}
              className="mt-auto pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="inline-flex items-center justify-center rounded-md px-2 py-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Show more"}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
