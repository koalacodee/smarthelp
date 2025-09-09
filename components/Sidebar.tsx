"use client";
import React, { JSX, useMemo, Suspense } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";
import { EmployeePermissions } from "@/lib/api/types";
import { SupervisorPermissions } from "@/lib/api/supervisors";
import SidebarSkeleton from "./Sidebar/SidebarSkeleton";

/* --- ICONS -------------------------------------------------------------- */
import CheckCircle from "@/icons/CheckCircle";
import ClipboardList from "@/icons/ClipboardList";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Eye from "@/icons/Eye";
import MagnifyingGlassCircle from "@/icons/MagnifyingGlassCircle";
import Megaphone from "@/icons/Megaphone";
import Ticket from "@/icons/Ticket";
import UserPlus from "@/icons/UserPlus";
import SidebarItem from "./Sidebar/SidebarItem";
import AnalyticsInsights from "@/icons/AnalyticsInsights";
import Team from "@/icons/Team";
import Supervisors from "@/icons/Supervisors";
import BookOpen from "@/icons/BookOpen";

/* --- CONFIG ------------------------------------------------------------- */
const ICON_SIZE = "w-5 h-5";

type Tab = {
  id: string;
  label: string;
  icon: JSX.Element;
  href: string;
  allowed: (role: string, permissions: string[]) => boolean;
  notification?: () => number; // optional selector
};

const tabs: Tab[] = [
  {
    id: "analytics",
    label: "Analytics And Insights",
    icon: <AnalyticsInsights className={ICON_SIZE} />,
    href: "/analytics",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.VIEW_ANALYTICS),
  },
  {
    id: "faqs",
    label: "FAQs",
    icon: <ClipboardList className={ICON_SIZE} />,
    href: "/faqs",
    allowed: (r, p) =>
      r !== "EMPLOYEE" || p.includes(EmployeePermissions.ADD_FAQS),
  },
  {
    id: "tickets",
    label: "Tickets",
    icon: <Ticket className={ICON_SIZE} />,
    href: "/tickets",
    allowed: (r, p) =>
      r !== "EMPLOYEE" || p.includes(EmployeePermissions.HANDLE_TICKETS),
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: <CheckCircle className={ICON_SIZE} />,
    href: "/tasks",
    allowed: (r, p) =>
      r === "ADMIN" ||
      (r === "SUPERVISOR" && p.includes(SupervisorPermissions.MANAGE_TASKS)) ||
      (r === "EMPLOYEE" && p.includes(EmployeePermissions.HANDLE_TASKS)),
  },
  // {
  //   id: "vehicles",
  //   label: "Vehicles",
  //   icon: <Car className={ICON_SIZE} />,
  //   href: "/vehicles",
  //   allowed: (r) => r === "ADMIN",
  // },
  {
    id: "manageTeam",
    label: "Manage Team",
    icon: <Team className={ICON_SIZE} />,
    href: "/manage-team",
    allowed: (r) => r !== "EMPLOYEE",
  },
  {
    id: "subDepartments",
    label: "Sub-departments",
    icon: <DocumentDuplicate className={ICON_SIZE} />,
    href: "/sub-departments",
    allowed: (r, p) =>
      r === "ADMIN" ||
      (r === "SUPERVISOR" &&
        p.includes(SupervisorPermissions.MANAGE_SUB_DEPARTMENTS)),
  },
  {
    id: "staffRequests",
    label: "Staff Requests",
    icon: <UserPlus className={ICON_SIZE} />,
    href: "/staff-requests",
    allowed: (r) => r !== "EMPLOYEE",
  },
  {
    id: "promotions",
    label: "Promotions",
    icon: <Megaphone className={ICON_SIZE} />,
    href: "/promotions",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.MANAGE_PROMOTIONS),
  },
  {
    id: "categories",
    label: "Categories",
    icon: <MagnifyingGlassCircle className={ICON_SIZE} />,
    href: "/department",
    allowed: (r) => r === "ADMIN",
  },
  {
    id: "supervisors",
    label: "Supervisors",
    icon: <Supervisors className={ICON_SIZE} />,
    href: "/supervisors",
    allowed: (r) => r === "ADMIN",
  },
  {
    id: "userActivity",
    label: "User Activity",
    icon: <Eye className={ICON_SIZE} />,
    href: "/user-activity",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.VIEW_USER_ACTIVITY),
  },
  {
    id: "knowledgeChunks",
    label: "Knowledge Chunks",
    icon: <BookOpen className={ICON_SIZE} />,
    href: "/knowledge-chunks",
    allowed: (r) => r === "ADMIN",
  },
];

/* --- COMPONENT ---------------------------------------------------------- */
function SidebarContent({ tabs, pathname }: { tabs: Tab[]; pathname: string }) {
  return (
    <aside className="fixed left-10 top-0 h-full w-64 z-40">
      <div className="h-full pt-20 pb-4 overflow-y-auto">
        <nav className="space-y-1 px-4">
          {tabs.map((tab) => (
            <SidebarItem
              key={tab.id}
              isActive={pathname === tab.href}
              item={tab}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUserStore();

  const visibleTabs = useMemo(() => {
    if (!user) return [];
    return tabs.filter((tab) => tab.allowed(user.role, user.permissions ?? []));
  }, [user]);

  if (pathname === "/login") return null;

  if (visibleTabs.length === 0) return <SidebarSkeleton />;

  return (
    <>
      {visibleTabs.length > 0 ? (
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarContent tabs={visibleTabs} pathname={pathname} />
        </Suspense>
      ) : (
        <SidebarSkeleton />
      )}
    </>
  );
}
