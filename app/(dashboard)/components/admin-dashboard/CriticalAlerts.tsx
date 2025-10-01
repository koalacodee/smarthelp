"use client";

import React from "react";
import AlertTriangle from "@/icons/AlertTriangle";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "a1",
    title: "High ticket volume",
    description: "Pending tickets exceeded weekly average by 35%",
    severity: "high",
  },
  {
    id: "a2",
    title: "Declining FAQ satisfaction",
    description: "Satisfaction dropped 6% week-over-week",
    severity: "medium",
  },
];

const badgeBySeverity: Record<AlertItem["severity"], string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export default function CriticalAlerts() {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl p-5">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
        <AlertTriangle className="h-4 w-4" /> Critical Alerts
      </h3>
      {MOCK_ALERTS.length === 0 ? (
        <p className="text-sm text-slate-500">No critical alerts</p>
      ) : (
        <ul className="space-y-3">
          {MOCK_ALERTS.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    badgeBySeverity[a.severity]
                  }`}
                >
                  {a.severity.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{a.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
