"use client";

import { useState, useEffect } from "react";
import { MemberManagementService } from "@/lib/api/v2";
import type {
  MemberWithGroupDetails,
  AddMemberRequest,
  UpdateMemberRequest,
} from "@/lib/api/v2/services/membership-management";
import { useAttachmentGroupsStore } from "../store/useAttachmentGroupsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import Plus from "@/icons/Plus";
import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";
import UserPlus from "@/icons/UserPlus";
import Cookie from "js-cookie";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

type StatusFilter = "all" | "online" | "offline";

export default function MemberManagementPanel() {
  const [members, setMembers] = useState<MemberWithGroupDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<MemberWithGroupDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Form states
  const [otp, setOtp] = useState("");
  const [memberName, setMemberName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const { attachmentGroups } = useAttachmentGroupsStore();
  const { addToast } = useToastStore();
  const { openModal: openConfirmation } = useConfirmationModalStore();
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const { locale } = useLocaleStore();
  const language = useLocaleStore((state) => state.language);

  if (!locale) return null;

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const response = await MemberManagementService.getAllMembersWithGroups();
      setMembers(response.members);
      const accessToken = Cookie.get("accessToken");
      if (!accessToken) return;
      await MemberManagementService.subscribeOnActiveMembers(
        accessToken,
        setActiveMembers
      );
    } catch (err: any) {
      addToast({
        message:
          err?.message || locale.myFiles.groups.members.toasts.loadFailed,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !memberName || !selectedGroupId) {
      addToast({
        message: locale.myFiles.groups.members.toasts.fillAllFields,
        type: "error",
      });
      return;
    }

    try {
      const request: AddMemberRequest = {
        otp,
        name: memberName,
        attachmentGroupId: selectedGroupId,
      };

      await MemberManagementService.addMember(request);

      addToast({
        message: locale.myFiles.groups.members.toasts.addSuccess,
        type: "success",
      });

      setIsAddModalOpen(false);
      resetForm();
      loadMembers();
    } catch (err: any) {
      addToast({
        message: err?.message || locale.myFiles.groups.members.toasts.addFailed,
        type: "error",
      });
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) return;

    try {
      const request: UpdateMemberRequest = {
        name: memberName || undefined,
        attachmentGroupId: selectedGroupId || undefined,
      };

      await MemberManagementService.updateMember(selectedMember.id, request);

      addToast({
        message: locale.myFiles.groups.members.toasts.updateSuccess,
        type: "success",
      });

      setIsEditModalOpen(false);
      resetForm();
      loadMembers();
    } catch (err: any) {
      addToast({
        message:
          err?.message || locale.myFiles.groups.members.toasts.updateFailed,
        type: "error",
      });
    }
  };

  const handleDeleteMember = (member: MemberWithGroupDetails) => {
    openConfirmation({
      title: locale.myFiles.groups.members.confirmations.deleteTitle,
      message:
        locale.myFiles.groups.members.confirmations.deleteMessage.replace(
          "{name}",
          member.name
        ),
      confirmText: locale.myFiles.groups.members.confirmations.confirmText,
      cancelText: locale.myFiles.groups.members.confirmations.cancelText,
      onConfirm: async () => {
        try {
          await MemberManagementService.deleteMember(member.id);

          addToast({
            message: locale.myFiles.groups.members.toasts.deleteSuccess,
            type: "success",
          });

          loadMembers();
        } catch (err: any) {
          addToast({
            message:
              err?.message || locale.myFiles.groups.members.toasts.deleteFailed,
            type: "error",
          });
        }
      },
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: MemberWithGroupDetails) => {
    setSelectedMember(member);
    setMemberName(member.name);
    setSelectedGroupId(member.attachmentGroup.id);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setOtp("");
    setMemberName("");
    setSelectedGroupId("");
    setSelectedMember(null);
  };

  // Filter members based on status
  const filteredMembers = members.filter((member) => {
    if (statusFilter === "all") return true;
    const isOnline = activeMembers.includes(member.id);
    if (statusFilter === "online") return isOnline;
    if (statusFilter === "offline") return !isOnline;
    return true;
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          {locale.myFiles.groups.members.loading}
        </div>
      </div>
    );
  }

  // Filter icon component (funnel icon)
  const FilterIcon = () => (
    <svg
      className="w-4 h-4 text-slate-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header with Add Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {locale.myFiles.groups.members.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {locale.myFiles.groups.members.description}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 transition"
        >
          <UserPlus className="w-4 h-4" />
          {locale.myFiles.groups.members.addButton}
        </button>
      </div>

      {/* Filter and Count Section - Top Control Bar */}
      {members.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon />
            <span className="text-sm text-slate-700">Filter by Status:</span>
            <div className="relative inline-block">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="appearance-none rounded border border-slate-300 bg-white px-3 py-1.5 pr-8 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Show All</option>
                <option value="online">
                  {locale.myFiles.groups.members.status.online}
                </option>
                <option value="offline">
                  {locale.myFiles.groups.members.status.offline}
                </option>
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </div>
      )}

      {/* Members List */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <UserPlus className="w-16 h-16 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-700">
            {locale.myFiles.groups.members.empty.title}
          </p>
          <p className="text-xs text-slate-500 max-w-md">
            {locale.myFiles.groups.members.empty.hint}
          </p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            No members found with the selected filter
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  NAME
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  STATUS
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  ATTACHMENT GROUP
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  CREATED
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const isOnline = activeMembers.includes(member.id);
                // Format date as M/D/YYYY
                const formattedDate = new Date(
                  member.createdAt
                ).toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    <td className="py-3 text-sm font-medium text-slate-900">
                      {member.name}
                    </td>
                    <td className="py-3">
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                          {locale.myFiles.groups.members.status.online}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-400 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                          {locale.myFiles.groups.members.status.offline}
                        </span>
                      )}
                    </td>
                    <td className="py-3 flex items-center justify-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium bg-blue-50 border-blue-400 text-blue-600`}
                      >
                        {member.attachmentGroup.name}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-500">
                      {formattedDate}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          className="inline-flex items-center justify-center rounded-md bg-green-50 p-1.5 text-green-600 hover:bg-green-100 transition"
                          aria-label="Edit member"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member)}
                          className="inline-flex items-center justify-center rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition"
                          aria-label="Delete member"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {locale.myFiles.groups.members.addModal.title}
            </h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {locale.myFiles.groups.members.addModal.otpLabel}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={
                    locale.myFiles.groups.members.addModal.otpPlaceholder
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {locale.myFiles.groups.members.addModal.nameLabel}
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={
                    locale.myFiles.groups.members.addModal.namePlaceholder
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {locale.myFiles.groups.members.addModal.groupLabel}
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">
                    {locale.myFiles.groups.members.addModal.groupPlaceholder}
                  </option>
                  {attachmentGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  {locale.myFiles.groups.members.addModal.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                >
                  {locale.myFiles.groups.members.addModal.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {locale.myFiles.groups.members.editModal.title}
            </h3>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {locale.myFiles.groups.members.editModal.nameLabel}
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={
                    locale.myFiles.groups.members.editModal.namePlaceholder
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {locale.myFiles.groups.members.editModal.groupLabel}
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">
                    {locale.myFiles.groups.members.editModal.groupPlaceholder}
                  </option>
                  {attachmentGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  {locale.myFiles.groups.members.editModal.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                >
                  {locale.myFiles.groups.members.editModal.update}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
