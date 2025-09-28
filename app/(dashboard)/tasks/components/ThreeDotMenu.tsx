"use client";

import { useState, useEffect } from "react";

interface MenuOption {
  label: string;
  onClick: () => void;
  color?: "green" | "red" | "blue" | "gray";
}

interface ThreeDotMenuProps {
  options: MenuOption[];
  className?: string;
}

export default function ThreeDotMenu({
  options,
  className = "",
}: ThreeDotMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-three-dot-menu]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getColorClasses = (color: string = "gray") => {
    switch (color) {
      case "green":
        return "text-green-700 hover:bg-green-50";
      case "red":
        return "text-red-700 hover:bg-red-50";
      case "blue":
        return "text-blue-700 hover:bg-blue-50";
      default:
        return "text-gray-700 hover:bg-gray-50";
    }
  };

  return (
    <div className={`relative ${className}`} data-three-dot-menu>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-0.5 hover:bg-gray-200 rounded transition-colors"
      >
        <svg
          className="w-3 h-3 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                option.onClick();
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-xs text-left transition-colors ${getColorClasses(
                option.color
              )}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
