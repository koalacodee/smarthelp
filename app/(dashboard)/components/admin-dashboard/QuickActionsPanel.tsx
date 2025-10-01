"use client";

import React from "react";
import Link from "next/link";
import Plus from "@/icons/Plus";
import Team from "@/icons/Team";
import Supervisors from "@/icons/Supervisors";
import AnalyticsInsights from "@/icons/AnalyticsInsights";

interface ActionItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const actions: ActionItem[] = [
  {
    label: "Create Department",
    href: "/department",
    icon: <Plus className="h-4 w-4" />,
  },
  {
    label: "Create Sub-department",
    href: "/sub-departments",
    icon: <Plus className="h-4 w-4" />,
  },
  {
    label: "Approve Staff Requests",
    href: "/staff-requests",
    icon: <Team className="h-4 w-4" />,
  },
  {
    label: "Create Supervisor",
    href: "/supervisors",
    icon: <Supervisors className="h-4 w-4" />,
  },
  {
    label: "View Reports",
    href: "/analytics",
    icon: <AnalyticsInsights className="h-4 w-4" />,
  },
];

export default function QuickActionsPanel() {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 hover:border-slate-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm group-hover:shadow">
              {a.icon}
            </span>
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
