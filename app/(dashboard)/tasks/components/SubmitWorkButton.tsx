"use client";
import React from "react";
import { Datum } from "@/lib/api/tasks";
import { useSubmitWorkModalStore } from "@/app/(dashboard)/store/useSubmitWorkModalStore";

interface SubmitWorkButtonProps {
  task: Datum;
}

export default function SubmitWorkButton({ task }: SubmitWorkButtonProps) {
  const { openModal } = useSubmitWorkModalStore();

  const handleClick = () => {
    openModal(task);
  };

  return (
    <>
      {task.status == "TODO" || task.status == "SEEN" ? (
        <button
          onClick={handleClick}
          className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition-colors"
        >
          Submit Work
        </button>
      ) : null}
    </>
  );
}
