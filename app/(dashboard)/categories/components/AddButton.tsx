"use client";

import { useState, useRef, useEffect } from "react";
import PlusIcon from "@/icons/Plus";
import { useCategoriesStore } from "../store/useCategoriesStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface AddButtonProps {
  userRole: string;
}

export default function AddButton({ userRole }: AddButtonProps) {
  const { locale } = useLocaleStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openModal } = useCategoriesStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddCategory = () => {
    openModal("category", "add");
    setIsOpen(false);
  };

  const handleAddSubCategory = () => {
    openModal("subCategory", "add");
    setIsOpen(false);
  };

  if (!locale) return null;

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-slate-200 py-2 min-w-[180px] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
          {userRole === "ADMIN" && (
            <button
              onClick={handleAddCategory}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {locale.categories.addButton.addCategory}
            </button>
          )}
          <button
            onClick={handleAddSubCategory}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            {locale.categories.addButton.addSubCategory}
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center ${isOpen ? "rotate-45" : ""}`}
      >
        <PlusIcon className="w-6 h-6 transition-transform duration-300" />
      </button>
    </div>
  );
}
