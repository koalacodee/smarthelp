"use client";

import { useState, useRef, useEffect } from "react";
import Building2 from "@/icons/Building2";
import Loader2 from "@/icons/Loader2";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import ModalShell from "../../_components/modals/ModalShell";
import { useDelegables, useDelegateTask } from "@/services/tasks";
import type { DelegableResponse } from "@/services/tasks/types";

export default function DelegationModal() {
  const locale = useLocaleStore((s) => s.locale);
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();
  const isOpen = activeModal === "delegation";
  const payload = modalPayload as { taskId: string } | null;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const delegateMutation = useDelegateTask();

  // Only search when query starts with @
  const searchEnabled =
    debouncedQuery.startsWith("@") && debouncedQuery.length > 1;
  const searchTerm = searchEnabled ? debouncedQuery.slice(1).trim() : "";
  const delegablesQuery = useDelegables(
    searchTerm,
    searchEnabled && searchTerm.length > 0,
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  if (!locale) return null;

  const handleSelect = (item: DelegableResponse) => {
    if (!payload?.taskId) return;
    const data =
      item.type === "EMPLOYEE"
        ? { taskId: payload.taskId, assigneeId: item.itemId }
        : { taskId: payload.taskId, targetSubDepartmentId: item.itemId };

    delegateMutation.mutate(data, {
      onSuccess: () => {
        setSearchQuery("");
        closeModal();
      },
    });
  };

  const results = delegablesQuery.data ?? [];
  const employees = results.filter((r) => r.type === "EMPLOYEE");
  const subDepartments = results.filter((r) => r.type !== "EMPLOYEE");
  const showResults = searchEnabled && searchTerm.length > 0;
  const noResults =
    showResults && !delegablesQuery.isLoading && results.length === 0;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <ModalShell isOpen={isOpen} onClose={closeModal} size="md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {locale.tasks.modals.delegation.title}
        </h2>

        {/* Search input */}
        <div className="relative mb-4">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale.tasks.modals.delegation.fields.supervisorPlaceholder
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {delegablesQuery.isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Results */}
        {showResults && results.length > 0 && (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {employees.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                  {locale.tasks.modals.delegation.fields.employees}
                </div>
                {employees.map((emp) => (
                  <button
                    key={emp.itemId}
                    onClick={() => handleSelect(emp)}
                    disabled={delegateMutation.isPending}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-600 font-medium text-sm border-2 border-gray-200">
                      {getInitials(emp.name)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {emp.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{emp.username}
                        {emp.jobTitle && ` • ${emp.jobTitle}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {subDepartments.length > 0 && (
              <div className="p-2 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                  {locale.tasks.modals.addTask.fields.subDepartment}
                </div>
                {subDepartments.map((dept) => (
                  <button
                    key={dept.itemId}
                    onClick={() => handleSelect(dept)}
                    disabled={delegateMutation.isPending}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-gray-200">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {dept.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {locale.tasks.modals.addTask.fields.subDepartment}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {noResults && (
          <div className="text-center py-8 text-gray-500">
            {locale.tasks.delegations?.empty?.title ?? "No results found"}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
