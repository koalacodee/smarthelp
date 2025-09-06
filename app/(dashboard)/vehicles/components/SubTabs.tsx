"use client";
import Briefcase from "@/icons/Briefcase";
import ClipboardList from "@/icons/ClipboardList";
import User from "@/icons/User";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Fleet Management",
    href: "/vehicles",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    label: "Licensing",
    href: "/vehicles/licensing",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    label: "Drivers & Tracking",
    href: "/vehicles/drivers",
    icon: <User className="w-5 h-5" />,
  },
];

export default function SubTabs() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`whitespace-nowrap flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            pathname === item.href
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </>
  );
}
