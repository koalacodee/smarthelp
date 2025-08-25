"use client";
import React from "react";
import Briefcase from "@/icons/Briefcase";
import Car from "@/icons/Car";
import CheckCircle from "@/icons/CheckCircle";
import ClipboardList from "@/icons/ClipboardList";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Eye from "@/icons/Eye";
import MagnifyingGlassCircle from "@/icons/MagnifyingGlassCircle";
import Megaphone from "@/icons/Megaphone";
import Ticket from "@/icons/Ticket";
import User from "@/icons/User";
import UserPlus from "@/icons/UserPlus";
import SidebarItem from "./Sidebar/SidebarItem";
import { usePathname } from "next/navigation";
const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Briefcase className="w-5 h-5" />,
    notificationCount: 0,
    href: "/",
  },
  {
    id: "faqs",
    label: "FAQs",
    icon: <ClipboardList className="w-5 h-5" />,
    notificationCount: 0,
    href: "/faqs",
  },
  {
    id: "tickets",
    label: "Tickets",
    icon: <Ticket className="w-5 h-5" />,
    notificationCount: 0,
    href: "/tickets",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: <CheckCircle className="w-5 h-5" />,
    notificationCount: 0 + 0,
    href: "/tasks",
  },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: <Car className="w-5 h-5" />,
    notificationCount: 0,
    href: "/vehicles",
  },
  {
    id: "manageTeam",
    label: "Manage Team",
    icon: <User className="w-5 h-5" />,
    notificationCount: 0,
    href: "/manage-team",
  },
  {
    id: "subDepartments",
    label: "Sub-departments",
    icon: <DocumentDuplicate className="w-5 h-5" />,
    notificationCount: 0,
    href: "/sub-departments",
  },
  {
    id: "staffRequests",
    label: "Staff Requests",
    icon: <UserPlus className="w-5 h-5" />,
    notificationCount: 0,
    href: "/staff-requests",
  },
  {
    id: "promotions",
    label: "Promotions",
    icon: <Megaphone className="w-5 h-5" />,
    notificationCount: 0,
    href: "/promotions",
  },
  {
    id: "categories",
    label: "Categories",
    icon: <MagnifyingGlassCircle className="w-5 h-5" />,
    notificationCount: 0,
    href: "/department",
  },
  {
    id: "supervisors",
    label: "Supervisors",
    icon: <User className="w-5 h-5" />,
    notificationCount: 0,
    href: "/supervisors",
  },
  {
    id: "userActivity",
    label: "User Activity",
    icon: <Eye className="w-5 h-5" />,
    notificationCount: 0,
    href: "/user-activity",
  },
];

// افتراضياً مديت قيم للـ openTicketsCount وغيره — لازم تعرفهم في مكان مناسب

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/login" && (
        <aside className="w-64 shrink-0">
          <nav className="space-y-1 block mb-6 lg:block">
            {tabs.map((tab) => (
              <SidebarItem
                key={tab.id}
                item={tab}
                isActive={pathname === tab.href}
              />
            ))}
          </nav>
        </aside>
      )}
    </>
  );
}
