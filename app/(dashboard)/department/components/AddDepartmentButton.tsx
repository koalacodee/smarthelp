"use client";

import { useCurrentEditingDepartment } from "@/app/(dashboard)/department/store/useCurrentEditingDepartment";

export default function AddDepartmentButton() {
  const { openModal } = useCurrentEditingDepartment();

  return (
    <button
      onClick={() => openModal("add", null)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      Add Department
    </button>
  );
}
