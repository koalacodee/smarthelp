"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export interface RecentActivityItem {
  id: string;
  type: "task" | "ticket" | "faq" | "user" | "promotion";
  description: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export default function RecentActivity({
  items,
}: {
  items: RecentActivityItem[];
}) {
  const { locale } = useLocaleStore();

  if (!locale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/90  shadow-xl p-5"
    >
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.4 }}
        className="mb-4 text-base font-semibold text-slate-800"
      >
        {locale.dashboard.admin.recentActivity.title}
      </motion.h3>
      {items.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.6 }}
          className="text-sm text-slate-500"
        >
          {locale.dashboard.admin.recentActivity.noActivity}
        </motion.p>
      ) : (
        <ul className="space-y-3">
          {items.map((a, index) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 1.6 + index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgb(241 245 249)",
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              title={a.timestamp}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.8 + index * 0.1 }}
                className="pr-3 truncate max-w-[75%]"
              >
                {a.description}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2 + index * 0.1 }}
                className="text-xs font-medium text-slate-500"
              >
                {new Date(a.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </motion.span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
