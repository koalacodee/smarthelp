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
        message: err?.message || "Failed to load members",
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
        message: "Please fill in all fields",
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
        message: "Member added successfully",
        type: "success",
      });

      setIsAddModalOpen(false);
      resetForm();
      loadMembers();
    } catch (err: any) {
      addToast({
        message: err?.message || "Failed to add member",
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
        message: "Member updated successfully",
        type: "success",
      });

      setIsEditModalOpen(false);
      resetForm();
      loadMembers();
    } catch (err: any) {
      addToast({
        message: err?.message || "Failed to update member",
        type: "error",
      });
    }
  };

  const handleDeleteMember = (member: MemberWithGroupDetails) => {
    openConfirmation({
      title: "Delete Member",
      message: `Are you sure you want to delete member "${member.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await MemberManagementService.deleteMember(member.id);

          addToast({
            message: "Member deleted successfully",
            type: "success",
          });

          loadMembers();
        } catch (err: any) {
          addToast({
            message: err?.message || "Failed to delete member",
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
          Loading members...
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
            TV Display Members
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage members who can access TV content displays
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <UserPlus className="w-16 h-16 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-700">No members yet</p>
          <p className="text-xs text-slate-500 max-w-md">
            Add members to grant them access to TV content displays
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Attachment Group
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Created
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                  Actions
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
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                          Offline
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
                    {new Date(member.createdAt).toLocaleDateString()}
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
              Add New Member
            </h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter OTP from display"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Member Name
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter member name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Attachment Group
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a group</option>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                >
                  Add Member
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
              Edit Member
            </h3>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Member Name
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Attachment Group
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select a group</option>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                >
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
