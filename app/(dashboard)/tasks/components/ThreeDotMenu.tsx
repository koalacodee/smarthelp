"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface MenuOption {
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
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position and close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest("[data-three-dot-menu]") &&
        !target.closest("[data-dropdown-menu]")
      ) {
        setIsOpen(false);
      }
    };

    const calculatePosition = () => {
      if (buttonRef.current && isOpen) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = options.length * 32 + 16; // More accurate height with padding
        const dropdownWidth = 120; // min-w-[120px]

        // Check if there's enough space below
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Determine position (top or bottom)
        let position: "top" | "bottom" = "bottom";
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          position = "top";
        }

        // Calculate horizontal position (right-aligned to button)
        let left = buttonRect.right - dropdownWidth;
        if (left < 0) {
          left = 8; // Small margin from viewport edge
        }
        if (left + dropdownWidth > viewportWidth) {
          left = viewportWidth - dropdownWidth - 8;
        }

        // Calculate vertical position
        let top: number;
        if (position === "top") {
          top = buttonRect.top - dropdownHeight - 4; // 4px gap
        } else {
          top = buttonRect.bottom + 4; // 4px gap
        }

        setDropdownPosition(position);
        setDropdownStyle({
          position: "fixed",
          top: `${top}px`,
          left: `${left}px`,
          zIndex: 9999,
        });
      }
    };

    if (isOpen) {
      // Small delay to ensure DOM is updated
      setTimeout(calculatePosition, 0);
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
    };
  }, [isOpen, options.length]);

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

  const dropdownContent = isOpen && (
    <div
      ref={menuRef}
      data-dropdown-menu
      style={dropdownStyle}
      className="bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
    >
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
  );

  return (
    <>
      <div className={`relative ${className}`} data-three-dot-menu>
        <button
          ref={buttonRef}
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
      </div>

      {typeof window !== "undefined" &&
        dropdownContent &&
        createPortal(dropdownContent, document.body)}
    </>
  );
}
