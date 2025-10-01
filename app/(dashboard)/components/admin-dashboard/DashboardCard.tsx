"use client";

import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentClassName?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  accentClassName = "bg-blue-500",
}: DashboardCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl transition-transform duration-300 hover:-translate-y-0.5">
      <div className="p-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-white text-slate-600 shadow-sm ring-1 ring-inset ring-white/40">
              {icon}
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-800 animate-[fadeIn_300ms_ease-out]">
                {value}
              </h3>
              {subtitle && (
                <span className="text-xs font-medium text-slate-500">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
