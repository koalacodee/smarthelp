"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useTaskPresetsStore } from "../store/useTaskPresetsStore";
import { TaskService } from "@/lib/api/v2";
import { TaskPresetDTO } from "@/lib/api/v2/models/task";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

export default function TaskPresetsModal() {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const {
    isPresetsModalOpen,
    setPresetsModalOpen,
    presets,
    setPresets,
    isLoading,
    setLoading,
    setSelectedPreset,
    setCreateFromPresetModalOpen,
  } = useTaskPresetsStore();
  const { addToast } = useToastStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isPresetsModalOpen) {
      fetchPresets();
    }
  }, [isPresetsModalOpen]);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const response = await TaskService.getTaskPresets();
      setPresets(response.presets);
    } catch (error) {
      addToast({
        message: locale?.tasks?.modals?.presets?.empty || "No presets found.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPresetsModalOpen(false);
    setSearchTerm("");
  };

  const handlePresetSelect = (preset: TaskPresetDTO) => {
    setSelectedPreset(preset);
    setPresetsModalOpen(false);
    setCreateFromPresetModalOpen(true);
  };

  const filteredPresets = presets.filter(
    (preset) =>
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!locale) return null;

  return (
    <Transition appear show={isPresetsModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        onClose={() => setPresetsModalOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 " />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                >
                  {locale.tasks.modals.presets.title}
                </DialogTitle>

                <div className="mt-4">
                  <input
                    type="text"
                    placeholder={locale.tasks.modals.presets.searchPlaceholder}
                    className="w-full border border-border rounded-md p-2 bg-background mb-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <div className="max-h-60 overflow-y-auto">
                    {isLoading ? (
                      <div className="py-4 text-center text-muted-foreground">
                        {locale.tasks.modals.presets.loading}
                      </div>
                    ) : filteredPresets.length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">
                        {searchTerm
                          ? locale.tasks.modals.presets.noMatch
                          : locale.tasks.modals.presets.empty}
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {filteredPresets.map((preset) => (
                          <li
                            key={preset.id}
                            onClick={() => handlePresetSelect(preset)}
                            className="p-3 rounded-md border border-border hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {preset.title}
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>
                                {locale.tasks.modals.presets.priority}{" "}
                                <span
                                  className={`font-medium ${
                                    preset.priority === "HIGH"
                                      ? "text-red-600"
                                      : preset.priority === "MEDIUM"
                                      ? "text-amber-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {preset.priority === "HIGH"
                                    ? locale.tasks.modals.addTask
                                        .priorityOptions.high
                                    : preset.priority === "MEDIUM"
                                    ? locale.tasks.modals.addTask
                                        .priorityOptions.medium
                                    : locale.tasks.modals.addTask
                                        .priorityOptions.low}
                                </span>
                              </span>
                              <span>
                                {formatDateWithHijri(
                                  preset.createdAt,
                                  language
                                )}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    {locale.tasks.modals.presets.buttons.close}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
