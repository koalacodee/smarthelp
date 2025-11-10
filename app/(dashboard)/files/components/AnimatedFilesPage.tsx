"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FilesTable from "./FilesTable";
import UploadModal from "./UploadModal";
import ShareModal from "./ShareModal";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Plus from "@/icons/Plus";
import { AttachmentGroupService, UploadService } from "@/lib/api/v2";
import AttachmentGroupsTable from "./AttachmentGroupsTable";
import AttachmentGroupModal from "./AttachmentGroupModal";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { AttachmentGroup } from "@/lib/api/v2/services/attachment-group";
import { Attachment as UploadAttachment } from "@/lib/api/v2/services/shared/upload";
import { EmployeePermissions } from "@/lib/api/types";
import { SupervisorPermissions } from "@/lib/api/supervisors";

interface AnimatedFilesPageProps {
  attachments: UploadAttachment[];
  totalCount: number;
  hasMore: boolean;
}

export default function AnimatedFilesPage({
  attachments,
  totalCount,
  hasMore,
}: AnimatedFilesPageProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [shareModalAttachment, setShareModalAttachment] =
    useState<UploadAttachment | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGroupShareModalOpen, setIsGroupShareModalOpen] = useState(false);
  const [sharingGroupId, setSharingGroupId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"files" | "groups">("files");
  const [attachmentGroups, setAttachmentGroups] = useState<AttachmentGroup[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAttachmentGroup, setSelectedAttachmentGroup] =
    useState<AttachmentGroup | null>(null);
  const [isAttachmentGroupModalOpen, setIsAttachmentGroupModalOpen] =
    useState(false);
  const [attachmentGroupModalMode, setAttachmentGroupModalMode] = useState<
    "view" | "edit" | "create"
  >("view");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [localAttachments, setLocalAttachments] = useState<UploadAttachment[]>(
    []
  );
  const { addToast } = useToastStore();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    (async () => {
      const user = await fetch("/server/me").then(
        async (res) => (await res.json()).user
      );

      setUserPermissions(user.permissions);
      setUserRole(user.role);
    })();
  }, []);

  const fetchAttachmentGroups = async () => {
    setIsLoading(true);
    try {
      const response = await AttachmentGroupService.getMyAttachmentGroups();
      setAttachmentGroups(response.attachmentGroups);
    } catch (error) {
      // Failed to fetch attachment groups:
      addToast({
        message: "Failed to fetch attachment groups",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize localAttachments with the prop attachments
  useEffect(() => {
    setLocalAttachments(attachments);
  }, [attachments]);

  useEffect(() => {
    if (activeTab === "groups") {
      fetchAttachmentGroups();
    }
  }, [activeTab, refreshTrigger]);

  const handleViewAttachmentGroup = (group: AttachmentGroup) => {
    setSelectedAttachmentGroup(group);
    setAttachmentGroupModalMode("view");
    setIsAttachmentGroupModalOpen(true);
  };

  const handleEditAttachmentGroup = (group: AttachmentGroup) => {
    setSelectedAttachmentGroup(group);
    setAttachmentGroupModalMode("edit");
    setIsAttachmentGroupModalOpen(true);
  };

  const handleShareAttachmentGroup = (group: AttachmentGroup) => {
    setSharingGroupId(group.id);
    setIsGroupShareModalOpen(true);
  };

  const handleDeleteAttachmentGroup = async (group: AttachmentGroup) => {
    if (!group || !group.id) return;

    try {
      await AttachmentGroupService.deleteAttachmentGroup(group.id);
      addToast({
        message: "Attachment group deleted successfully",
        type: "success",
      });

      // Update the local state by filtering out the deleted group
      setAttachmentGroups((current) =>
        current.filter((item) => item.id !== group.id)
      );

      // Also trigger a refresh to ensure server-side consistency
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      // Failed to delete attachment group:
      addToast({
        message: "Failed to delete attachment group",
        type: "error",
      });
    }
  };

  const handleRefresh = async () => {
    // Increment refresh trigger
    setRefreshTrigger((prev) => prev + 1);

    // Fetch fresh attachments after upload or deletion
    try {
      const response = await UploadService.getMyAttachments();
      setLocalAttachments(response.attachments);
    } catch (error) {
      // Failed to refresh attachments:
      addToast({
        message: "Failed to refresh attachments",
        type: "error",
      });
    }
  };

  // Handle individual attachment deletion
  const handleDeleteAttachment = (attachment: UploadAttachment) => {
    // Update the local state by filtering out the deleted attachment
    setLocalAttachments((current) =>
      current.filter((item) => item.id !== attachment.id)
    );

    // Also trigger a refresh for server-side consistency
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreateAttachmentGroup = () => {
    setSelectedAttachmentGroup(null);
    setAttachmentGroupModalMode("create");
    setIsAttachmentGroupModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 relative overflow-hidden"
    >
      {/* Background Animation Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.7 }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.9 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-2xl"
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: "backOut",
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.3 },
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
            >
              <DocumentDuplicate className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: "easeOut",
              }}
              className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
            >
              My Files
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              Manage and preview your uploaded files and attachments
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Files
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-4 text-sm text-slate-500"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{totalCount} Total Files</span>
              </motion.div>
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>More available</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        {(userRole === "ADMIN" ||
          userPermissions.includes(
            EmployeePermissions.MANAGE_ATTACHMENT_GROUPS
          ) || userPermissions.includes(SupervisorPermissions.MANAGE_ATTACHMENT_GROUPS)) && (
            <NavigationTabs onTabChange={setActiveTab} activeTab={activeTab} />
          )}

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: "easeOut",
          }}
          whileHover={{
            y: -3,
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8"
          >
            {activeTab === "files" && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.7, ease: "backOut" }}
                    className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </motion.svg>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-xl font-bold text-slate-800 flex items-center gap-2"
                  >
                    Files & Attachments
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.9,
                        ease: "backOut",
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                    >
                      {totalCount}
                    </motion.span>
                  </motion.h2>
                </motion.div>
                <FilesTable
                  attachments={localAttachments as any}
                  onShare={(attachment) => {
                    setShareModalAttachment(attachment as any);
                    setIsShareModalOpen(true);
                  }}
                  onDelete={handleDeleteAttachment}
                  onRefresh={handleRefresh}
                />
              </>
            )}

            {activeTab === "groups" && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex items-center justify-between mb-6"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.7,
                        ease: "backOut",
                      }}
                      className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </motion.svg>
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="text-xl font-bold text-slate-800 flex items-center gap-2"
                    >
                      Attachment Groups
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.9,
                          ease: "backOut",
                        }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                      >
                        {attachmentGroups.length}
                      </motion.span>
                    </motion.h2>
                  </div>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    onClick={handleCreateAttachmentGroup}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </motion.button>
                </motion.div>
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <AttachmentGroupsTable
                    attachmentGroups={attachmentGroups}
                    onView={handleViewAttachmentGroup}
                    onEdit={handleEditAttachmentGroup}
                    onShare={handleShareAttachmentGroup}
                    onDelete={handleDeleteAttachmentGroup}
                  />
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleRefresh}
      />

      {/* Share Modal for Single Attachments */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareModalAttachment(null);
        }}
        attachment={shareModalAttachment as any}
      />

      {/* Share Modal for Attachment Groups */}
      <ShareModal
        isOpen={isGroupShareModalOpen}
        onClose={() => {
          setIsGroupShareModalOpen(false);
          setSharingGroupId(undefined);
        }}
        attachment={null}
        isGroup={true}
        groupId={sharingGroupId}
      />

      {/* Attachment Group Modal */}
      <AttachmentGroupModal
        isOpen={isAttachmentGroupModalOpen}
        onClose={() => {
          setIsAttachmentGroupModalOpen(false);
          setSelectedAttachmentGroup(null);
        }}
        attachmentGroup={selectedAttachmentGroup}
        onUpdate={fetchAttachmentGroups}
        availableAttachments={attachments as any}
        mode={attachmentGroupModalMode}
      />
    </motion.div>
  );
}

function NavigationTabs({
  onTabChange,
  activeTab,
}: {
  onTabChange: (tab: "files" | "groups") => void;
  activeTab: "files" | "groups";
}) {
  return (
    <>
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center mb-6"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-md inline-flex">
          <button
            onClick={() => onTabChange("files")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "files"
                ? "bg-blue-500 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Individual Files
          </button>
          <button
            onClick={() => onTabChange("groups")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "groups"
                ? "bg-blue-500 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Attachment Groups
          </button>
        </div>
      </motion.div>
    </>
  );
}
