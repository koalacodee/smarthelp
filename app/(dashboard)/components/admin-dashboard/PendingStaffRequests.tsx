"use client";

import React from "react";
import Link from "next/link";
import UserPlus from "@/icons/UserPlus";

export interface PendingRequestItem {
  id: string;
  candidateName: string | null;
  requestedBy: { id: string; name: string } | null;
  createdAt: string;
}

export default function PendingStaffRequests({
  items,
  total,
}: {
  items: PendingRequestItem[];
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">
          Pending Staff Requests ({total})
        </h3>
        <Link
          href="/staff-requests"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          <UserPlus className="h-3.5 w-3.5" /> Review
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No pending requests</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Candidate
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Requested By
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm text-slate-800">
                    {r.candidateName ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {r.requestedBy?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
