"use client";

import { useState, useRef, useEffect } from "react";
import Plus from "@/icons/Plus";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../_store/use-v2-task-page-store";

export default function AddTaskFab() {
  const locale = useLocaleStore((state) => state.locale);
  const { openModal } = useV2TaskPageStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!locale) return null;

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-10">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-border overflow-hidden w-64">
          <button
            onClick={() => {
              openModal("add-task");
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 text-sm"
          >
            {locale.tasks.teamTasks.fab?.newTask ?? "Create New Task"}
          </button>
          <button
            onClick={() => {
              openModal("presets");
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 text-sm"
          >
            {locale.tasks.teamTasks.fab?.fromPreset ?? "Create from Preset"}
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
