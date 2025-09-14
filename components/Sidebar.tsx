"use client";
import React, {
  JSX,
  useMemo,
  Suspense,
  useState,
  useEffect,
  useRef,
} from "react";
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
import Burger from "@/icons/Burger";

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

/* --- OVERLAY COMPONENT -------------------------------------------------- */
function Overlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
      onClick={onClose}
    />
  );
}

/* --- SIDEBAR CONTENT COMPONENT ----------------------------------------- */
function SidebarContent({
  tabs,
  pathname,
  isOpen,
  onClose,
}: {
  tabs: Tab[];
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-full pt-8 pb-4 overflow-y-auto bg-white shadow-xl">
        <nav className="space-y-1 px-4">
          {tabs.map((tab) => (
            <SidebarItem
              key={tab.id}
              isActive={pathname === tab.href}
              item={tab}
              onClick={onClose}
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
  const [isOpen, setIsOpen] = useState(false);

  const visibleTabs = useMemo(() => {
    if (!user) return [];
    return tabs.filter((tab) => tab.allowed(user.role, user.permissions ?? []));
  }, [user]);

  // Auto-close sidebar when pathname changes (navigation)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  if (pathname === "/login") return null;

  if (visibleTabs.length === 0) return <SidebarSkeleton />;

  return (
    <>
      {/* Burger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md hover:bg-gray-50 transition-colors duration-200"
        aria-label="Toggle sidebar"
      >
        <Burger className="w-6 h-6" />
      </button>

      {/* Overlay */}
      <Overlay isOpen={isOpen} onClose={closeSidebar} />

      {/* Sidebar Content */}
      {visibleTabs.length > 0 && (
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarContent
            tabs={visibleTabs}
            pathname={pathname}
            isOpen={isOpen}
            onClose={closeSidebar}
          />
        </Suspense>
      )}
    </>
  );
}
