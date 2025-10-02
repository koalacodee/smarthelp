"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm shadow-xl p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="mb-4 flex items-center justify-between"
      >
        <h3 className="text-base font-semibold text-slate-800">
          Pending Staff Requests ({total})
        </h3>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/staff-requests"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
          >
            <UserPlus className="h-3.5 w-3.5" /> Review
          </Link>
        </motion.div>
      </motion.div>
      {items.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.4 }}
          className="text-sm text-slate-500"
        >
          No pending requests
        </motion.p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.4 }}
          className="overflow-hidden rounded-xl border border-slate-200"
        >
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
              {items.map((r, index) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                  whileHover={{
                    backgroundColor: "rgb(248 250 252)",
                    transition: { duration: 0.2 },
                  }}
                  className="hover:bg-slate-50"
                >
                  <td className="px-4 py-2 text-sm text-slate-800">
                    {r.candidateName ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {r.requestedBy?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
