"use client";

import { FileHubAttachmentGroupService } from "@/lib/api/v2";
import AttachmentGroupsGrid from "./components/AttachmentGroupsGrid";
import { useEffect, useState } from "react";
import type { AttachmentGroupSummary } from "@/lib/api/v2/services/filehub-attachment-groups";
import Plus from "@/icons/Plus";
import { useAttachments } from "@/hooks/useAttachments";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import FileHubAttachmentGroupModal from "./components/FileHubAttachmentGroupModal";
import FileHubShareModal from "./components/FileHubShareModal";

export default function GroupsPage() {
  const [attachmentGroups, setAttachmentGroups] = useState<
    AttachmentGroupSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAttachmentGroupModalOpen, setIsAttachmentGroupModalOpen] =
    useState(false);
  const [selectedAttachmentGroup, setSelectedAttachmentGroup] =
    useState<AttachmentGroupSummary | null>(null);
  const [attachmentGroupModalMode, setAttachmentGroupModalMode] = useState<
    "view" | "edit" | "create"
  >("view");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingGroupId, setSharingGroupId] = useState<string | null>(null);
  const { fetchMyAttachments, myAttachments } = useAttachments();
  const { addToast } = useToastStore();

  useEffect(() => {
    loadAttachmentGroups();
    fetchMyAttachments();
  }, []);

  const loadAttachmentGroups = async () => {
    try {
      setIsLoading(true);
      const { attachmentGroups } =
        await FileHubAttachmentGroupService.getMyAttachmentGroups();
      setAttachmentGroups(attachmentGroups);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load TV content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAttachmentGroup = () => {
    setSelectedAttachmentGroup(null);
    setAttachmentGroupModalMode("create");
    setIsAttachmentGroupModalOpen(true);
  };

  const handleViewAttachmentGroup = (group: AttachmentGroupSummary) => {
    setSelectedAttachmentGroup(group);
    setAttachmentGroupModalMode("view");
    setIsAttachmentGroupModalOpen(true);
  };

  const handleEditAttachmentGroup = (group: AttachmentGroupSummary) => {
    setSelectedAttachmentGroup(group);
    setAttachmentGroupModalMode("edit");
    setIsAttachmentGroupModalOpen(true);
  };

  const handleShareAttachmentGroup = (group: AttachmentGroupSummary) => {
    setSharingGroupId(group.id);
    setIsShareModalOpen(true);
  };

  const handleDeleteAttachmentGroup = async (group: AttachmentGroupSummary) => {
    // This is handled in the grid component
    loadAttachmentGroups();
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          Loading TV content...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TV Content</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your TV content and share collections of files.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateAttachmentGroup}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create TV Content
        </button>
      </div>

      <AttachmentGroupsGrid
        attachmentGroups={attachmentGroups}
        onGroupDeleted={loadAttachmentGroups}
        onView={handleViewAttachmentGroup}
        onEdit={handleEditAttachmentGroup}
        onShare={handleShareAttachmentGroup}
      />

      {/* Attachment Group Modal */}
      <FileHubAttachmentGroupModal
        isOpen={isAttachmentGroupModalOpen}
        onClose={() => {
          setIsAttachmentGroupModalOpen(false);
          setSelectedAttachmentGroup(null);
        }}
        attachmentGroup={selectedAttachmentGroup}
        onUpdate={loadAttachmentGroups}
        availableAttachments={myAttachments as any}
        mode={attachmentGroupModalMode}
      />

      {/* Share Modal */}
      <FileHubShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharingGroupId(null);
        }}
        groupId={sharingGroupId}
      />
    </div>
  );
}
