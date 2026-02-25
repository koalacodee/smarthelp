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
import MemberManagementPanel from "./components/MemberManagementPanel";
import { useAttachmentGroupsStore } from "./store/useAttachmentGroupsStore";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface GroupsPageClientProps {
  locale: Locale;
  language: string;
}

export default function GroupsPageClient({
  locale,
  language,
}: GroupsPageClientProps) {
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
  const { setAttachmentGroups: setStoreAttachmentGroups } =
    useAttachmentGroupsStore();
  const { setLocale } = useLocaleStore();

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);

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
      // Update the store for use in MemberManagementPanel
      setStoreAttachmentGroups(attachmentGroups);
      setError(null);
    } catch (err: any) {
      const { locale: storeLocale } = useLocaleStore.getState();
      setError(
        err?.message ||
          storeLocale?.myFiles?.groups?.loadError ||
          "Failed to load TV content"
      );
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
      <div className="font-cairo min-h-full bg-[var(--groups-bg)] p-6 md:p-8">
        <div className="flex items-center justify-center py-12 text-sm text-gray-500">
          {locale.myFiles.groups.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-cairo min-h-full bg-[var(--groups-bg)] p-6 md:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="font-cairo min-h-full bg-[var(--groups-bg)] p-6 md:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-900">
            {locale.myFiles.groups.pageHeader.title}
          </h1>
          <p className="mt-1 text-[0.95rem] text-gray-500">
            {locale.myFiles.groups.pageHeader.description}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateAttachmentGroup}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-[0.95rem] font-semibold text-white transition hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          {locale.myFiles.groups.createButton}
        </button>
      </div>

      <div className="space-y-6 max-w-[1600px] mx-auto">
        <AttachmentGroupsGrid
          attachmentGroups={attachmentGroups}
          onGroupDeleted={loadAttachmentGroups}
          onView={handleViewAttachmentGroup}
          onEdit={handleEditAttachmentGroup}
          onShare={handleShareAttachmentGroup}
        />

        {/* Member Management Panel */}
        <MemberManagementPanel />
      </div>

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
