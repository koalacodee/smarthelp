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

export default function MemberManagementPanel() {
  const [members, setMembers] = useState<MemberWithGroupDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<MemberWithGroupDetails | null>(null);

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
        message:
          err?.message || locale.myFiles.groups.members.toasts.addFailed,
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
      message: locale.myFiles.groups.members.confirmations.deleteMessage.replace(
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

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          {locale.myFiles.groups.members.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.myFiles.groups.members.table.name}
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.myFiles.groups.members.table.attachmentGroup}
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.myFiles.groups.members.table.created}
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                  {locale.myFiles.groups.members.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50">
                  <td className="py-3 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      {activeMembers.includes(member.id) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                          {locale.myFiles.groups.members.status.online}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                          {locale.myFiles.groups.members.status.offline}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {member.attachmentGroup.key}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-slate-500">
                    {formatDateWithHijri(member.createdAt, language)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        className="inline-flex items-center justify-center rounded-full border border-green-200 p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 transition"
                        aria-label="Edit member"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member)}
                        className="inline-flex items-center justify-center rounded-full border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                        aria-label="Delete member"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                  placeholder={locale.myFiles.groups.members.addModal.otpPlaceholder}
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
                  placeholder={locale.myFiles.groups.members.addModal.namePlaceholder}
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
                      {group.key}
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
                  placeholder={locale.myFiles.groups.members.editModal.namePlaceholder}
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
                      {group.key}
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
