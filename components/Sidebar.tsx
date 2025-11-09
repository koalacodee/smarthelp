"use client";
import React, { JSX, useMemo, Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { EmployeePermissions } from "@/lib/api/types";
import { SupervisorPermissions } from "@/lib/api/supervisors";

/* --- ICONS -------------------------------------------------------------- */
import CheckCircle from "@/icons/CheckCircle";
import ClipboardList from "@/icons/ClipboardList";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Eye from "@/icons/Eye";
import MagnifyingGlassCircle from "@/icons/MagnifyingGlassCircle";
import Megaphone from "@/icons/Megaphone";
import Ticket from "@/icons/Ticket";
import SidebarItem from "./Sidebar/SidebarItem";
import AnalyticsInsights from "@/icons/AnalyticsInsights";
import Team from "@/icons/Team";
import Supervisors from "@/icons/Supervisors";
import BookOpen from "@/icons/BookOpen";
import Burger from "@/icons/Burger";
import UserInfo from "./UserInfo";
import { UserResponse } from "@/lib/api";

/* --- CONFIG ------------------------------------------------------------- */
const ICON_SIZE = "w-5 h-5";

type Tab = {
  id: string;
  label: string;
  icon: JSX.Element;
  href: string;
  allowed: (role: string, permissions: string[]) => boolean;
  notification?: () => number; // optional selector
  subLinks?: {
    label: string;
    href: string;
  }[];
};

const tabs: Tab[] = [
  {
    id: "analytics",
    label: "Analytics And Insights",
    icon: <AnalyticsInsights className={ICON_SIZE} />,
    href: "/",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.VIEW_ANALYTICS),
  },
  {
    id: "faqsAndCategories",
    label: "FAQs & Categories",
    icon: <ClipboardList className={ICON_SIZE} />,
    href: "/faqs",
    allowed: (r, p) =>
      r === "ADMIN" ||
      r === "SUPERVISOR" ||
      (r === "EMPLOYEE" && p.includes(EmployeePermissions.ADD_FAQS)),
    subLinks: [
      {
        label: "FAQs",
        href: "/faqs",
      },
      {
        label: "Categories",
        href: "/department",
      },
    ],
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
    subLinks: [
      {
        label: "Team Tasks",
        href: "/tasks",
      },
      {
        label: "My Tasks",
        href: "/tasks/my-tasks",
      },
    ],
  },
  // {
  //   id: "vehicles",
  //   label: "Vehicles",
  //   icon: <Car className={ICON_SIZE} />,
  //   href: "/vehicles",
  //   allowed: (r) => r === "ADMIN",
  //   subLinks: [
  //     {
  //       label: "Fleet Management",
  //       href: "/vehicles",
  //     },
  //     {
  //       label: "Licensing",
  //       href: "/vehicles/licensing",
  //     },
  //     {
  //       label: "Drivers & Tracking",
  //       href: "/vehicles/drivers",
  //     },
  //   ],
  // },
  {
    id: "manageTeam",
    label: "Manage Team",
    icon: <Team className={ICON_SIZE} />,
    href: "/manage-team",
    allowed: (r) => r !== "EMPLOYEE",
  },

  // {
  //   id: "staffRequests",
  //   label: "Staff Requests",
  //   icon: <UserPlus className={ICON_SIZE} />,
  //   href: "/staff-requests",
  //   allowed: (r) => r !== "EMPLOYEE",
  // },
  {
    id: "promotions",
    label: "Promotions",
    icon: <Megaphone className={ICON_SIZE} />,
    href: "/promotions",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.MANAGE_PROMOTIONS),
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
  {
    id: "files",
    label: "My Files",
    icon: <DocumentDuplicate className={ICON_SIZE} />,
    href: "/files",
    allowed: (r, p) => true, // Allow all users to access their files
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
  user,
}: {
  tabs: Tab[];
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
  user: any;
}) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="h-full pt-8 pb-0 overflow-y-auto bg-white shadow-xl flex flex-col">
        {/* Header with Logo and Title */}
        <div className="px-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <img
                src="/icons/smarthelp.png"
                alt="SmartHelp Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                SmartHelp
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Support Dashboard
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-4 flex-1 pt-4">
          {tabs.map((tab) => {
            // For tasks, only show sub-links for supervisors
            // For FAQs & Categories, filter subLinks based on user permissions
            let filteredSubLinks = tab.subLinks;

            if (tab.id === "tasks") {
              filteredSubLinks = user?.role === "SUPERVISOR" ? tab.subLinks : undefined;
            } else if (tab.id === "faqsAndCategories" && tab.subLinks) {
              // Filter subLinks based on user role and permissions
              filteredSubLinks = tab.subLinks.filter((subLink) => {
                if (subLink.href === "/faqs") {
                  // FAQs: accessible to ADMIN, SUPERVISOR, or EMPLOYEE with ADD_FAQS permission
                  return (
                    user?.role === "ADMIN" ||
                    user?.role === "SUPERVISOR" ||
                    (user?.role === "EMPLOYEE" &&
                      user?.permissions?.includes(EmployeePermissions.ADD_FAQS))
                  );
                } else if (subLink.href === "/department") {
                  // Categories: only accessible to ADMIN and SUPERVISOR
                  return user?.role === "ADMIN" || user?.role === "SUPERVISOR";
                }
                return true;
              });
              // If no subLinks remain, don't show subLinks at all
              if (filteredSubLinks.length === 0) {
                filteredSubLinks = undefined;
              }
            }

            const itemWithSubLinks = {
              ...tab,
              subLinks: filteredSubLinks,
            };

            return (
              <SidebarItem
                key={tab.id}
                isActive={pathname === tab.href}
                item={itemWithSubLinks}
                onClick={onClose}
              />
            );
          })}
        </nav>

        {/* User Info at the bottom */}
        <UserInfo />
      </div>
    </aside>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const visibleTabs = useMemo(() => {
    if (!user) return [];
    return tabs.filter((tab) => tab.allowed(user.role, user.permissions ?? []));
  }, [user]);

  // Auto-close sidebar when pathname changes (navigation)

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

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

  // if (visibleTabs.length === 0) return <SidebarSkeleton />;

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
        <Suspense>
          <SidebarContent
            tabs={visibleTabs}
            pathname={pathname}
            isOpen={isOpen}
            onClose={closeSidebar}
            user={user}
          />
        </Suspense>
      )}
    </>
  );
}
