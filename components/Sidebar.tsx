"use client";
import React, { JSX, useMemo, Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { EmployeePermissions } from "@/lib/api/types";
import { SupervisorPermissions } from "@/lib/api/supervisors";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { isRTL } from "@/locales/isRTL";

/* --- ICONS -------------------------------------------------------------- */
import CheckCircle from "@/icons/CheckCircle";
import ClipboardList from "@/icons/ClipboardList";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Eye from "@/icons/Eye";
import Megaphone from "@/icons/Megaphone";
import Ticket from "@/icons/Ticket";
import SidebarItem from "./Sidebar/SidebarItem";
import AnalyticsInsights from "@/icons/AnalyticsInsights";
import Team from "@/icons/Team";
import Supervisors from "@/icons/Supervisors";
import Burger from "@/icons/Burger";
import User from "@/icons/User";
import UserInfo from "./UserInfo";
import { UserResponse } from "@/lib/api";
import { Locale } from "@/locales/type";

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

const getTabs = (locale: any): Tab[] => [
  {
    id: "analytics",
    label: locale.components.sidebar.tabs.analytics,
    icon: <AnalyticsInsights className={ICON_SIZE} />,
    href: "/",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.VIEW_ANALYTICS),
  },
  {
    id: "faqsAndCategories",
    label: locale.components.sidebar.tabs.faqsAndCategories,
    icon: <ClipboardList className={ICON_SIZE} />,
    href: "/faqs",
    allowed: (r, p) =>
      r === "ADMIN" ||
      r === "SUPERVISOR" ||
      (r === "EMPLOYEE" && p.includes(EmployeePermissions.ADD_FAQS)),
    subLinks: [
      {
        label: locale.components.sidebar.tabs.faqs,
        href: "/faqs",
      },
      {
        label: locale.components.sidebar.tabs.categories,
        href: "/categories",
      },
    ],
  },
  {
    id: "tickets",
    label: locale.components.sidebar.tabs.tickets,
    icon: <Ticket className={ICON_SIZE} />,
    href: "/tickets",
    allowed: (r, p) =>
      r !== "EMPLOYEE" || p.includes(EmployeePermissions.HANDLE_TICKETS),
  },
  {
    id: "tasks",
    label: locale.components.sidebar.tabs.tasks,
    icon: <CheckCircle className={ICON_SIZE} />,
    href: "/tasks",
    allowed: (r, p) =>
      r === "ADMIN" ||
      (r === "SUPERVISOR" && p.includes(SupervisorPermissions.MANAGE_TASKS)) ||
      (r === "EMPLOYEE" && p.includes(EmployeePermissions.HANDLE_TASKS)),
    subLinks: [
      {
        label: locale.components.sidebar.tabs.teamTasks,
        href: "/tasks",
      },
      {
        label: locale.components.sidebar.tabs.myTasks,
        href: "/tasks/my-tasks",
      },
    ],
  },

  {
    id: "manageTeam",
    label: locale.components.sidebar.tabs.manageTeam,
    icon: <Team className={ICON_SIZE} />,
    href: "/manage-team",
    allowed: (r) => r !== "EMPLOYEE",
  },
  {
    id: "promotions",
    label: locale.components.sidebar.tabs.promotions,
    icon: <Megaphone className={ICON_SIZE} />,
    href: "/promotions",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.MANAGE_PROMOTIONS),
  },
  {
    id: "supervisors",
    label: locale.components.sidebar.tabs.supervisors,
    icon: <Supervisors className={ICON_SIZE} />,
    href: "/supervisors",
    allowed: (r) => r === "ADMIN",
  },
  {
    id: "userActivity",
    label: locale.components.sidebar.tabs.userActivity,
    icon: <Eye className={ICON_SIZE} />,
    href: "/user-activity",
    allowed: (r, p) =>
      r === "ADMIN" || p.includes(SupervisorPermissions.VIEW_USER_ACTIVITY),
  },
  {
    id: "files",
    label: locale.components.sidebar.tabs.myFiles,
    icon: <DocumentDuplicate className={ICON_SIZE} />,
    href: "/files",
    allowed: (r, p) => true, // Allow all users to access their files
    subLinks: [
      {
        label: locale.components.sidebar.tabs.attachments,
        href: "/my-files/filehub",
      },
      {
        label: locale.components.sidebar.tabs.tvContent,
        href: "/my-files/filehub/groups",
      },
    ],
  },
  {
    id: "profile",
    label: locale.components.sidebar.tabs.myProfile,
    icon: <User className={ICON_SIZE} />,
    href: "/profile",
    allowed: (r, p) => true, // Allow all users to access their profile
  },
  {
    id: "settings",
    label: locale.components.sidebar.tabs.settings,
    icon: (
      <svg
        className={ICON_SIZE}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    href: "/settings",
    allowed: (r, p) => true, // Allow all users to access settings
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
      className="fixed inset-0 bg-black/50  z-40 transition-opacity duration-300"
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
  locale,
}: {
  tabs: Tab[];
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  locale: Locale;
}) {
  const language = useLocaleStore((state) => state.language);
  const rtl = isRTL(language || "en");

  return (
    <aside
      className={`fixed ${
        rtl ? "right-0" : "left-0"
      } top-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen
          ? "translate-x-0"
          : rtl
          ? "translate-x-full"
          : "-translate-x-full"
      }`}
    >
      <div className="h-full pt-8 pb-0 overflow-y-auto bg-white shadow-xl flex flex-col">
        {/* Header with Logo and Title */}
        <div className="px-4 pb-6 border-b border-slate-200">
          <div className={`flex items-center gap-3 ${rtl ? "flex-row-reverse justify-end" : ""}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <img
                src="/icons/smarthelp.png"
                alt="SmartHelp Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className={rtl ? "text-right" : "text-left"}>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                {locale.components.sidebar.header.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {locale.components.sidebar.header.subtitle}
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
              // Filter subLinks for tasks: show all for supervisors, but filter for others
              if (user?.role === "SUPERVISOR") {
                filteredSubLinks = tab.subLinks;
              } else if (user?.role === "ADMIN") {
                // Admins see Team Tasks only
                filteredSubLinks = tab.subLinks?.filter(
                  (subLink) => subLink.href === "/tasks"
                );
              } else {
                // Employees only see My Tasks
                filteredSubLinks = tab.subLinks?.filter(
                  (subLink) => subLink.href === "/tasks/my-tasks"
                );
              }
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
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const pathname = usePathname();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const rtl = isRTL(language || "en");

  const tabs = locale ? getTabs(locale) : [];

  const visibleTabs = useMemo(() => {
    if (!user || !locale) return [];
    return tabs.filter((tab) => tab.allowed(user.role, user.permissions ?? []));
  }, [user, locale, tabs]);

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
        className={`fixed top-4 ${
          rtl ? "right-4" : "left-4"
        } z-10 p-2 rounded-md bg-white shadow-md hover:bg-gray-50 transition-colors duration-200`}
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
            locale={locale || ({} as Locale)}
          />
        </Suspense>
      )}
    </>
  );
}
