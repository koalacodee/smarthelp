"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import AlertTriangle from "@/icons/AlertTriangle";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

export interface ExpiredAttachmentItem {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  expirationDate: string;
  userId: string | null;
  guestId: string | null;
  isGlobal: boolean;
  size: number;
  createdAt: string;
  updatedAt: string;
  targetId: string;
  cloned: boolean;
}

export default function ExpiredAttachments({
  items,
}: {
  items: ExpiredAttachmentItem[];
}) {
  const { locale } = useLocaleStore();
  const language = useLocaleStore((state) => state.language);

  if (!locale) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/90  shadow-xl p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="mb-4 flex items-center justify-between"
      >
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {locale.dashboard.admin.expiredAttachments.title} ({items.length})
        </h3>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/my-files/filehub"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-500"
          >
            <DocumentDuplicate className="h-3.5 w-3.5" />
            {locale.dashboard.admin.expiredAttachments.manage}
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
          {locale.dashboard.admin.expiredAttachments.noAttachments}
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
                  {locale.dashboard.admin.expiredAttachments.file}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.dashboard.admin.expiredAttachments.size}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.dashboard.admin.expiredAttachments.type}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.dashboard.admin.expiredAttachments.status}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.dashboard.admin.expiredAttachments.expires}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.dashboard.admin.expiredAttachments.created}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((item, index) => {
                const expired = isExpired(item.expirationDate);
                const daysLeft = getDaysUntilExpiration(item.expirationDate);

                return (
                  <motion.tr
                    key={item.id}
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
                      <div className="flex items-center gap-2">
                        <DocumentDuplicate className="h-3 w-3 text-slate-400" />
                        <span
                          className="truncate max-w-[180px]"
                          title={item.originalName}
                        >
                          {item.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {formatFileSize(item.size)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          expired
                            ? "bg-red-100 text-red-800"
                            : daysLeft <= 3
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {expired
                          ? locale.dashboard.admin.expiredAttachments.expired
                          : daysLeft <= 3
                          ? locale.dashboard.admin.expiredAttachments.expiringSoon
                          : locale.dashboard.admin.expiredAttachments.active}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {formatDateWithHijri(item.expirationDate, language)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {formatDateWithHijri(item.createdAt, language)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
