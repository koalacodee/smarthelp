"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Plus from "@/icons/Plus";
import Supervisors from "@/icons/Supervisors";
import { UserResponse } from "@/lib/api";

interface ActionItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowed: (role: string, permissions: string[]) => boolean;
}

const actions: ActionItem[] = [
  {
    label: "Create Department",
    href: "/department",
    icon: <Plus className="h-4 w-4" />,
    allowed: (r) => r === "ADMIN" || r === "SUPERVISOR",
  },
  {
    label: "Create Supervisor",
    href: "/supervisors",
    icon: <Supervisors className="h-4 w-4" />,
    allowed: (r) => r === "ADMIN",
  },
];

export default function QuickActionsPanel() {
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  const visibleActions = useMemo(() => {
    if (!user) return [];
    return actions.filter((action) =>
      action.allowed(user.role, user.permissions ?? [])
    );
  }, [user]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/90  shadow-xl p-5"
    >
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mb-4 text-base font-semibold text-slate-800"
      >
        Quick Actions
      </motion.h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleActions.map((a, index) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.8 + index * 0.1,
              ease: "easeOut",
            }}
            whileHover={{
              y: -4,
              scale: 1.02,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={a.href}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md"
            >
              <motion.span
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm group-hover:shadow"
              >
                {a.icon}
              </motion.span>
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
