"use client";

import { useState, useEffect } from "react";
import { MemberManagementService } from "@/lib/api/v2";
import type {
  MemberWithGroupDetails,
  AddMemberRequest,
  UpdateMemberRequest,
  AvailableDepartmentsResponse,
  CursorMeta,
} from "@/lib/api/v2/services/membership-management";
import { useAttachmentGroupsStore } from "../store/useAttachmentGroupsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";
import UserPlus from "@/icons/UserPlus";
import RefreshCw from "@/icons/RefreshCw";
import ChevronLeft from "@/icons/ChevronLeft";
import ChevronRight from "@/icons/ChevronRight";
import Cookie from "js-cookie";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

type StatusFilter = "all" | "online" | "offline";

export default function MemberManagementPanel() {
  const [members, setMembers] = useState<MemberWithGroupDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<MemberWithGroupDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
  const [reauthMember, setReauthMember] =
    useState<MemberWithGroupDetails | null>(null);
  const [reauthOtp, setReauthOtp] = useState("");
  const [availableDepartments, setAvailableDepartments] =
    useState<AvailableDepartmentsResponse | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<CursorMeta | null>(
    null
  );
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>("");

  // Form states
  const [otp, setOtp] = useState("");
  const [memberName, setMemberName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const { attachmentGroups } = useAttachmentGroupsStore();
  const { addToast } = useToastStore();
  const { openModal: openConfirmation } = useConfirmationModalStore();
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const { locale } = useLocaleStore();
  const language = useLocaleStore((state) => state.language);

  if (!locale) return null;

  useEffect(() => {
    loadMembers();
    loadAvailableDepartments();
  }, []);

  // Clear Unassigned filter when user is not admin
  useEffect(() => {
    if (
      filterDepartmentId === "__unassigned__" &&
      availableDepartments &&
      availableDepartments.role !== "admin"
    ) {
      setFilterDepartmentId("");
      loadMembers({ filterDepartmentIdOverride: "" });
    }
  }, [availableDepartments, filterDepartmentId]);

  const loadAvailableDepartments = async () => {
    try {
      const data =
        await MemberManagementService.getAvailableDepartmentsForMember();
      setAvailableDepartments(data);
    } catch {
      // Non-blocking: department selection will be empty
      setAvailableDepartments(null);
    }
  };

  const loadMembers = async (params?: {
    cursor?: string;
    direction?: "next" | "prev";
    filterDepartmentIdOverride?: string;
  }) => {
    const effectiveDeptId =
      params?.filterDepartmentIdOverride !== undefined
        ? params.filterDepartmentIdOverride
        : filterDepartmentId;
    try {
      setIsLoading(true);
      const response = await MemberManagementService.getAllMembersWithGroups({
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.direction && { direction: params.direction }),
        pageSize: 20,
        ...(effectiveDeptId && {
          filterDepartmentId:
            effectiveDeptId === "__unassigned__"
              ? "__unassigned__"
              : effectiveDeptId,
        }),
      });
      setMembers(response.members);
      setPaginationMeta(response.meta);
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
        ...(selectedDepartmentId && { departmentId: selectedDepartmentId }),
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
        ...(selectedDepartmentId !== undefined && {
          departmentId: selectedDepartmentId || undefined,
        }),
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
    // Auto-assign department if supervisor/employee has exactly one
    if (availableDepartments && availableDepartments.role !== "admin") {
      const depts = availableDepartments.departments;
      if (depts.length === 1) {
        setSelectedDepartmentId(depts[0].id);
      }
    }
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: MemberWithGroupDetails) => {
    setSelectedMember(member);
    setMemberName(member.name);
    setSelectedGroupId(member.attachmentGroup.id);
    setSelectedDepartmentId(member.department?.id ?? "");
    setIsEditModalOpen(true);
  };

  const openReauthModal = (member: MemberWithGroupDetails) => {
    setReauthMember(member);
    setReauthOtp("");
    setIsReauthModalOpen(true);
  };

  const handleReauthMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reauthMember || !reauthOtp) {
      addToast({
        message: locale.myFiles.groups.members.toasts.fillAllFields,
        type: "error",
      });
      return;
    }

    try {
      await MemberManagementService.reauthMember({
        otp: reauthOtp,
        memberId: reauthMember.id,
      });

      addToast({
        message: locale.myFiles.groups.members.reauthModal.toasts.success,
        type: "success",
      });

      setIsReauthModalOpen(false);
      setReauthMember(null);
      setReauthOtp("");
      loadMembers();
    } catch (err: any) {
      addToast({
        message:
          err?.message || locale.myFiles.groups.members.reauthModal.toasts.failed,
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setOtp("");
    setMemberName("");
    setSelectedGroupId("");
    setSelectedDepartmentId("");
    setSelectedMember(null);
  };

  // Status is client-side only: filter members by online/offline for display
  const displayMembers = members.filter((member) => {
    if (statusFilter === "all") return true;
    const isOnline = activeMembers.includes(member.id);
    if (statusFilter === "online") return isOnline;
    if (statusFilter === "offline") return !isOnline;
    return true;
  });

  // Flatten department options for the filter dropdown
  const departmentFilterOptions: { value: string; label: string }[] = [
    { value: "", label: locale.myFiles.groups.members.filters?.departmentAll ?? "All Departments" },
    ...(availableDepartments?.role === "admin"
      ? [{ value: "__unassigned__", label: locale.myFiles.groups.members.filters?.departmentUnassigned ?? "Unassigned" }]
      : []),
  ];
  if (availableDepartments) {
    if (availableDepartments.role === "admin") {
      availableDepartments.mainDepartments.forEach((main) => {
        if (main.includeMainAsOption !== false) {
          departmentFilterOptions.push({ value: main.id, label: main.name });
        }
        main.subDepartments.forEach((sub) => {
          departmentFilterOptions.push({ value: sub.id, label: sub.name });
        });
      });
    } else {
      availableDepartments.departments.forEach((d) => {
        departmentFilterOptions.push({ value: d.id, label: d.name });
      });
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-12 text-sm text-gray-500">
          {locale.myFiles.groups.members.loading}
        </div>
      </div>
    );
  }

  // Filter icon component (funnel icon) - inline SVG
  const FilterIcon = () => (
    <svg
      className="h-4 w-4 text-gray-600"
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
    <>
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {locale.myFiles.groups.members.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {locale.myFiles.groups.members.description}
        </p>
      </div>

      {/* Filter Section - Department and Status */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <FilterIcon />
          <span className="text-sm text-gray-500">
            {locale.myFiles.groups.members.filters?.departmentLabel ?? "Department"}:
          </span>
          <div className="relative inline-block">
            <select
              value={filterDepartmentId}
              onChange={(e) => {
                const newValue = e.target.value;
                setFilterDepartmentId(newValue);
                loadMembers({ filterDepartmentIdOverride: newValue });
              }}
              className="min-w-[140px] appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {departmentFilterOptions.map((opt) => (
                <option key={opt.value || "__all__"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <div className="relative inline-block">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="min-w-[140px] appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
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
        {members.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing {displayMembers.length} members
          </div>
        )}
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
          <UserPlus className="mb-2 h-16 w-16 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">
            {locale.myFiles.groups.members.empty.title}
          </p>
          <p className="max-w-md text-xs text-gray-500">
            {locale.myFiles.groups.members.empty.hint}
          </p>
        </div>
      ) : displayMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
          <p className="text-sm font-medium text-gray-700">
            No members found with the selected filter
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ATTACHMENT GROUP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {locale.myFiles.groups.members.departmentColumn}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  CREATED
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.map((member) => {
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
                  <tr key={member.id} className="border-b border-gray-100 transition hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-3">
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                          {locale.myFiles.groups.members.status.online}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                          {locale.myFiles.groups.members.status.offline}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
                        {member.attachmentGroup.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.department?.name ??
                        locale.myFiles.groups.members.unassigned}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formattedDate}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReauthModal(member)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-600"
                          aria-label="Re-auth member"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600 transition hover:bg-green-100"
                          aria-label="Edit member"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                          aria-label="Delete member"
                        >
                          <Trash className="h-4 w-4" />
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

      {/* Pagination */}
      {paginationMeta &&
        (paginationMeta.hasNextPage || paginationMeta.hasPrevPage) && (
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() =>
                loadMembers({
                  cursor: paginationMeta.prevCursor,
                  direction: "prev",
                })
              }
              disabled={!paginationMeta.hasPrevPage}
              className="flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {locale.myFiles.groups.members.pagination?.previous ?? "Previous"}
            </button>
            <button
              type="button"
              onClick={() =>
                loadMembers({
                  cursor: paginationMeta.nextCursor,
                  direction: "next",
                })
              }
              disabled={!paginationMeta.hasNextPage}
              className="flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locale.myFiles.groups.members.pagination?.next ?? "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[90%] max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-900">
                {locale.myFiles.groups.members.addModal.title}
              </h3>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  {locale.myFiles.groups.members.addModal.otpLabel}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  placeholder={
                    locale.myFiles.groups.members.addModal.otpPlaceholder
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  {locale.myFiles.groups.members.addModal.nameLabel}
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  placeholder={
                    locale.myFiles.groups.members.addModal.namePlaceholder
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  {locale.myFiles.groups.members.addModal.groupLabel}
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
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

              {availableDepartments && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    {locale.myFiles.groups.members.addModal.departmentLabel}
                  </label>
                  {availableDepartments.role === "admin" ? (
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) =>
                        setSelectedDepartmentId(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">
                        {
                          locale.myFiles.groups.members.addModal
                            .departmentPlaceholder
                        }
                      </option>
                      {availableDepartments.mainDepartments.map((main) => (
                        <optgroup key={main.id} label={main.name}>
                          {main.includeMainAsOption !== false && (
                            <option value={main.id}>{main.name}</option>
                          )}
                          {main.subDepartments.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : availableDepartments.departments.length === 1 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {
                        locale.myFiles.groups.members.addModal
                          .departmentStatic
                      }
                      : {availableDepartments.departments[0].name}
                    </div>
                  ) : availableDepartments.departments.length > 1 ? (
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) =>
                        setSelectedDepartmentId(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">
                        {
                          locale.myFiles.groups.members.addModal
                            .departmentPlaceholder
                        }
                      </option>
                      {availableDepartments.departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              )}

              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-6 py-2 text-[0.95rem] font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100"
                >
                  {locale.myFiles.groups.members.addModal.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-500 px-6 py-2 text-[0.95rem] font-semibold text-white transition hover:bg-blue-600"
                >
                  {locale.myFiles.groups.members.addModal.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-auth Member Modal */}
      {isReauthModalOpen && reauthMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[90%] max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-900">
                {locale.myFiles.groups.members.reauthModal.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {locale.myFiles.groups.members.reauthModal.description.replace(
                  "{name}",
                  reauthMember.name
                )}
              </p>
            </div>
            <form onSubmit={handleReauthMember}>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    {locale.myFiles.groups.members.reauthModal.otpLabel}
                  </label>
                  <input
                    type="text"
                    value={reauthOtp}
                    onChange={(e) => setReauthOtp(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    placeholder={
                      locale.myFiles.groups.members.reauthModal.otpPlaceholder
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsReauthModalOpen(false);
                    setReauthMember(null);
                    setReauthOtp("");
                  }}
                  className="rounded-lg border border-gray-200 px-6 py-2 text-[0.95rem] font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100"
                >
                  {locale.myFiles.groups.members.reauthModal.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-500 px-6 py-2 text-[0.95rem] font-semibold text-white transition hover:bg-blue-600"
                >
                  {locale.myFiles.groups.members.reauthModal.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[90%] max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-900">
                {locale.myFiles.groups.members.editModal.title}
              </h3>
            </div>
            <form onSubmit={handleUpdateMember}>
              <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  {locale.myFiles.groups.members.editModal.nameLabel}
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  placeholder={
                    locale.myFiles.groups.members.editModal.namePlaceholder
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  {locale.myFiles.groups.members.editModal.groupLabel}
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
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

              {availableDepartments && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    {locale.myFiles.groups.members.editModal.departmentLabel}
                  </label>
                  {availableDepartments.role === "admin" ? (
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) =>
                        setSelectedDepartmentId(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">
                        {
                          locale.myFiles.groups.members.editModal
                            .departmentPlaceholder
                        }
                      </option>
                      {availableDepartments.mainDepartments.map((main) => (
                        <optgroup key={main.id} label={main.name}>
                          {main.includeMainAsOption !== false && (
                            <option value={main.id}>{main.name}</option>
                          )}
                          {main.subDepartments.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : availableDepartments.departments.length === 1 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      {
                        locale.myFiles.groups.members.editModal
                          .departmentStatic
                      }
                      : {availableDepartments.departments[0].name}
                    </div>
                  ) : availableDepartments.departments.length > 1 ? (
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) =>
                        setSelectedDepartmentId(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">
                        {
                          locale.myFiles.groups.members.editModal
                            .departmentPlaceholder
                        }
                      </option>
                      {availableDepartments.departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              )}

              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-6 py-2 text-[0.95rem] font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100"
                >
                  {locale.myFiles.groups.members.editModal.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-500 px-6 py-2 text-[0.95rem] font-semibold text-white transition hover:bg-blue-600"
                >
                  {locale.myFiles.groups.members.editModal.update}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    {/* Fixed Add Member button - bottom-right */}
    <button
      type="button"
      onClick={openAddModal}
      className="fixed bottom-6 right-6 z-10 inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-[0.95rem] font-semibold text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition hover:-translate-y-0.5 hover:bg-blue-600"
    >
      <UserPlus className="w-4 h-4" />
      {locale.myFiles.groups.members.addButton}
    </button>
    </>
  );
}
