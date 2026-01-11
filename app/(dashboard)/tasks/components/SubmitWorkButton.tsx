"use client";
import React from "react";
import { Datum } from "@/lib/api/tasks";
import { useSubmitWorkModalStore } from "@/app/(dashboard)/store/useSubmitWorkModalStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface SubmitWorkButtonProps {
  task: Datum;
}

export default function SubmitWorkButton({ task }: SubmitWorkButtonProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { openModal } = useSubmitWorkModalStore();

  const handleClick = () => {
    openModal(task);
  };

  if (!locale) return null;

  return (
    <>
      {task.status == "TODO" || task.status == "SEEN" ? (
        <button
          onClick={handleClick}
          className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition-colors"
        >
          {locale.tasks.myTasks.actions.submitWork}
        </button>
      ) : null}
    </>
  );
}
