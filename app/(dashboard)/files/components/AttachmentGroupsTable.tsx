"use client";

import React from "react";
import { motion } from "framer-motion";
import { AttachmentGroup } from "@/lib/api/v2/services/attachment-group";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Eye from "@/icons/Eye";
import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";
import { useState } from "react";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";

interface AttachmentGroupsTableProps {
  attachmentGroups: AttachmentGroup[];
  onView: (attachmentGroup: AttachmentGroup) => void;
  onEdit: (attachmentGroup: AttachmentGroup) => void;
  onShare?: (attachmentGroup: AttachmentGroup) => void;
  onDelete?: (attachmentGroup: AttachmentGroup) => void;
}

const formatDate = (date: Date) => {
  return (
    new Date(date).toLocaleDateString() +
    " " +
    new Date(date).toLocaleTimeString()
  );
};

export default function AttachmentGroupsTable({
  attachmentGroups,
  onView,
  onEdit,
  onShare,
  onDelete,
}: AttachmentGroupsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (attachmentGroups.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <DocumentDuplicate className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg font-medium">
          No attachment groups found
        </p>
        <p className="text-slate-400 text-sm mt-1">
          Create an attachment group to see it here
        </p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-slate-50/50">
            <tr>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Group Key
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Files
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                IP Addresses
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {attachmentGroups.map((group, index) => (
              <motion.tr
                key={group.id}
                className="hover:bg-slate-50/50 transition-colors duration-200 group"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      📁
                    </div>
                    <div className="min-w-0 flex-1 max-w-58">
                      <p
                        className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 truncate"
                        title={group.key}
                      >
                        {group.key}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {group.attachments.length} files
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                  <div className="max-w-xs truncate">
                    {group.ips.length > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {group.ips.length} watchers
                      </span>
                    ) : (
                      <span className="text-slate-400">No watchers</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                  <div>
                    <p className="font-medium">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(group.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center">
                    <ThreeDotMenu
                      options={[
                        {
                          label: "View",
                          onClick: () => onView(group),
                          color: "blue" as "blue",
                        },
                        {
                          label: "Edit",
                          onClick: () => onEdit(group),
                          color: "green" as "green",
                        },
                        ...(onShare
                          ? [
                              {
                                label: "Share",
                                onClick: () => onShare(group),
                                color: "blue" as "blue",
                              },
                            ]
                          : []),
                        ...(onDelete
                          ? [
                              {
                                label:
                                  deletingId === group.id
                                    ? "Deleting..."
                                    : "Delete",
                                onClick: () => {
                                  if (deletingId !== group.id) {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this attachment group?"
                                      )
                                    ) {
                                      setDeletingId(group.id);
                                      onDelete(group);
                                      // Reset deleting state after a short delay
                                      setTimeout(
                                        () => setDeletingId(null),
                                        500
                                      );
                                    }
                                  }
                                },
                                color: "red" as "red",
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
