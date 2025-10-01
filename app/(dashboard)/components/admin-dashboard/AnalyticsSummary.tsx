"use client";

import React, { useState } from "react";

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
    <div className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Analytics Summary
      </h3>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="col-span-2 space-y-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <span className="text-sm font-medium text-slate-600">
                {kpi.label}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col space-y-3">
          {departmentPerformance
            .slice(0, expanded ? departmentPerformance.length : 6)
            .map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">{d.name}</span>
                  <span className="font-semibold text-slate-800">
                    {d.score}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${d.score}%` }}
                  />
                </div>
              </div>
            ))}
          {departmentPerformance.length > 6 && (
            <div className="mt-auto pt-1">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md px-2 py-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
