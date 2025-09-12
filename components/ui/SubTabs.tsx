"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function SubTabs({
  tabs,
}: {
  tabs: {
    label: string;
    href: string;
    icon: ReactNode;
  }[];
}) {
  const pathname = usePathname();

  return (
    <>
      {tabs.map((item, idx) => (
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
