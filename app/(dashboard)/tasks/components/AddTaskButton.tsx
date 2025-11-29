"use client";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { useTaskPresetsStore } from "../store/useTaskPresetsStore";
import Plus from "@/icons/Plus";
import CheckCircle from "@/icons/CheckCircle";

export default function AddTaskButton() {
  const setOpen = useTaskModalStore((state) => state.setOpen);
  const { setPresetsModalOpen } = useTaskPresetsStore();
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);

  // Close dropup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target as Node)
      ) {
        setIsDropupOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-10" ref={dropupRef}>
      {isDropupOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-border overflow-hidden w-64">
          <button
            onClick={() => {
              setOpen(true);
              setIsDropupOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span>Create New Task</span>
          </button>
          <button
            onClick={() => {
              setPresetsModalOpen(true);
              setIsDropupOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Create From Preset</span>
          </button>
        </div>
      )}
      <Button onClick={() => setIsDropupOpen(!isDropupOpen)}>
        Add New Task
      </Button>
    </div>
  );
}
