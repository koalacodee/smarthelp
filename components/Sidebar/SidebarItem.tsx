"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ArrowRight from "@/icons/ArrowRight";

export default function SidebarItem({
  item,
  isActive,
  onClick,
}: {
  item: {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    notificationCount?: number;
    subLinks?: {
      label: string;
      href: string;
    }[];
  };
  isActive: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasSubLinks = item.subLinks && item.subLinks.length > 0;
  const hasSingleSubLink = item.subLinks && item.subLinks.length === 1;
  const hasMultipleSubLinks = item.subLinks && item.subLinks.length > 1;
  const isSubLinkActive =
    hasSubLinks && item.subLinks?.some((subLink) => pathname === subLink.href);
  const isMainLinkActive = pathname === item.href;
  const shouldShowAsActive = isMainLinkActive || isSubLinkActive;

  const handleMainLinkClick = () => {
    if (hasMultipleSubLinks) {
      setIsExpanded(!isExpanded);
    } else {
      onClick?.();
    }
  };

  // If there's only one subLink, render it as a normal link
  if (hasSingleSubLink && item.subLinks) {
    const singleSubLink = item.subLinks[0];
    const isSingleSubLinkActive = pathname === singleSubLink.href;

    return (
      <Link
        href={singleSubLink.href}
        onClick={onClick}
        className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isSingleSubLinkActive
          ? "bg-blue-100 text-blue-700"
          : "text-slate-700 hover:bg-slate-200"
          }`}
      >
        {item.icon}
        <span className="ml-3 flex-1">{singleSubLink.label}</span>
        {item.notificationCount && item.notificationCount > 0 ? (
          <span className="ml-auto inline-block py-0.5 px-2.5 text-xs font-semibold text-white bg-red-500 rounded-full">
            {item.notificationCount}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div className="w-full">
      {/* Main Link */}
      {hasMultipleSubLinks ? (
        <div
          onClick={handleMainLinkClick}
          className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${shouldShowAsActive
            ? "bg-blue-100 text-blue-700"
            : "text-slate-700 hover:bg-slate-200"
            }`}
        >
          {item.icon}
          <span className="ml-3 flex-1">{item.label}</span>
          {item.notificationCount && item.notificationCount > 0 ? (
            <span className="ml-auto inline-block py-0.5 px-2.5 text-xs font-semibold text-white bg-red-500 rounded-full">
              {item.notificationCount}
            </span>
          ) : null}
          <ArrowRight
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""
              }`}
          />
        </div>
      ) : (
        <Link
          href={item.href}
          onClick={onClick}
          className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${shouldShowAsActive
            ? "bg-blue-100 text-blue-700"
            : "text-slate-700 hover:bg-slate-200"
            }`}
        >
          {item.icon}
          <span className="ml-3 flex-1">{item.label}</span>
          {item.notificationCount && item.notificationCount > 0 ? (
            <span className="ml-auto inline-block py-0.5 px-2.5 text-xs font-semibold text-white bg-red-500 rounded-full">
              {item.notificationCount}
            </span>
          ) : null}
        </Link>
      )}

      {/* Sub Links */}
      {hasMultipleSubLinks && isExpanded && item.subLinks && (
        <div className="ml-6 mt-1 space-y-1">
          {item.subLinks.map((subLink, index) => {
            const isSubLinkActive = pathname === subLink.href;
            return (
              <Link
                key={index}
                href={subLink.href}
                onClick={onClick}
                className={`block px-3 py-2 text-sm rounded-md transition-colors ${isSubLinkActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {subLink.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
