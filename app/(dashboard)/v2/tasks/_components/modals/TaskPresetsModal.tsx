"use client";

import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useTaskPresets } from "@/services/tasks";
import ModalShell from "./ModalShell";

export default function TaskPresetsModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, closeModal, openModal } = useV2TaskPageStore();
  const [search, setSearch] = useState("");
  const presetsQuery = useTaskPresets({}, activeModal === "presets");

  const isOpen = activeModal === "presets";
  const presets = presetsQuery.data?.presets ?? [];
  const filtered = presets.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (preset: (typeof presets)[0]) => {
    closeModal();
    openModal("create-from-preset", preset);
  };

  if (!locale) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={closeModal} size="sm">
      <DialogTitle
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
      >
        {locale.tasks.modals.presets?.title ?? "Task Presets"}
      </DialogTitle>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={
          locale.tasks.modals.presets?.searchPlaceholder ?? "Search presets..."
        }
        className="w-full border border-border rounded-md p-2 bg-background mb-4 mt-4"
      />
      <div className="max-h-60 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            {locale.tasks.modals.presets?.empty ?? "No presets found"}
          </p>
        ) : (
          filtered.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className="w-full text-left p-3 rounded-md border border-border hover:bg-gray-100 cursor-pointer transition-colors mb-2"
            >
              <p className="font-medium">{preset.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {preset.title}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span
                  className={
                    preset.priority === "HIGH"
                      ? "text-red-600"
                      : preset.priority === "MEDIUM"
                        ? "text-amber-600"
                        : "text-green-600"
                  }
                >
                  {preset.priority}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {locale.tasks.modals.presets?.buttons.close ?? "Close"}
        </button>
      </div>
    </ModalShell>
  );
}
