"use client";

import React from "react";

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
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Recent Activity
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No recent activity</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              title={a.timestamp}
            >
              <span className="pr-3 truncate max-w-[75%]">{a.description}</span>
              <span className="text-xs font-medium text-slate-500">
                {new Date(a.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
