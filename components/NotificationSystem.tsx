"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BellIcon from "@/icons/Bell";
import BriefcaseIcon from "@/icons/Briefcase";
import UserPlusIcon from "@/icons/UserPlus";
import { NotificationService, UserResponse } from "@/lib/api";

// Notification types from the backend
type NotificationType =
  | "staff_request_created"
  | "staff_request_resolved"
  | "task_created"
  | "task_approved"
  | "task_rejected"
  | "task_submitted"
  | "task_delegation_created"
  | "ticket_assigned"
  | "ticket_created"
  | "ticket_reopened"
  | "ticket_opened";

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSystemProps {
  onNotificationClick?: (notification: AppNotification) => void;
  onDismiss?: (notification: AppNotification) => void;
}

// Message generation based on notification type and title
const generateNotificationMessage = (
  notification: AppNotification,
  count?: number
): string => {
  const { type, title } = notification;

  switch (type) {
    // Staff Request notifications
    case "staff_request_created":
      return `A new staff request has been created: "${title}".`;
    case "staff_request_resolved":
      return `Staff request "${title}" has been resolved.`;

    // Task notifications
    case "task_created":
      return `A new task has been created: "${title}".`;
    case "task_approved":
      return `Your task "${title}" has been approved and completed.`;
    case "task_rejected":
      return `Your task "${title}" was rejected and requires changes.`;
    case "task_submitted":
      return `Task "${title}" has been submitted for review.`;
    case "task_delegation_created":
      return `A new task has been delegated: "${title}".`;

    // Ticket notifications
    case "ticket_assigned":
      return `Ticket "${title}" has been assigned to you.`;
    case "ticket_created":
    case "ticket_opened":
      return `A new ticket has been created: "${title}".`;
    case "ticket_reopened":
      return `Ticket "${title}" has been reopened for review.`;

    default:
      return `New notification: ${title}`;
  }
};

// Map notification types to their corresponding sidebar hrefs
const getNotificationHref = (
  type: NotificationType,
  isSupervisor: boolean = false
): string => {
  switch (type) {
    // Task notifications -> Tasks page
    case "task_created":
    case "task_approved":
    case "task_rejected":
      return isSupervisor ? "/tasks/my-tasks" : "/tasks";
    case "task_delegation_created":
    case "task_submitted":
      return "/tasks";

    // Ticket notifications -> Tickets page
    case "ticket_assigned":
    case "ticket_created":
    case "ticket_reopened":
    case "ticket_opened":
      return "/tickets";

    // Staff request notifications -> Staff Requests page
    case "staff_request_created":
    case "staff_request_resolved":
      return "/staff-requests";

    default:
      return "/";
  }
};

// Notification configuration based on type
const getNotificationConfig = (
  type: NotificationType,
  isSupervisor: boolean = false
) => {
  // Group types by category for consistent styling
  const getCategoryConfig = (notificationType: NotificationType) => {
    if (notificationType.startsWith("task_")) {
      return {
        icon: <BriefcaseIcon className="w-10 h-10 text-red-500" />,
        iconBg: "bg-red-100",
        buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        buttonText: "Go to Tasks",
        borderClass: "border-t-4 border-red-500",
        href: getNotificationHref(notificationType, isSupervisor),
      };
    }

    if (notificationType.startsWith("ticket_")) {
      return {
        icon: <BellIcon className="w-10 h-10 text-blue-500" />,
        iconBg: "bg-blue-100",
        buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        buttonText: "Go to Tickets",
        borderClass: "border-t-4 border-blue-500",
        href: getNotificationHref(notificationType, isSupervisor),
      };
    }

    if (notificationType.startsWith("staff_request_")) {
      return {
        icon: <UserPlusIcon className="w-10 h-10 text-green-500" />,
        iconBg: "bg-green-100",
        buttonClass: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
        buttonText: "Go to Team",
        borderClass: "border-t-4 border-green-500",
        href: getNotificationHref(notificationType, isSupervisor),
      };
    }

    // Default configuration
    return {
      icon: <BellIcon className="w-10 h-10 text-gray-500" />,
      iconBg: "bg-gray-100",
      buttonClass: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
      buttonText: "View Details",
      borderClass: "border-t-4 border-gray-500",
      href: "/",
    };
  };

  return getCategoryConfig(type);
};

const NotificationModal: React.FC<{
  notification: AppNotification;
  count?: number;
  onDismiss: () => void;
  onNavigate: () => void;
  isSupervisor: boolean;
}> = ({ notification, count, onDismiss, onNavigate, isSupervisor }) => {
  const { type, title } = notification;
  const config = getNotificationConfig(type, isSupervisor);
  const message = generateNotificationMessage(notification, count);

  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onDismiss}
      role="dialog"
      aria-labelledby="notification-title"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all animate-scale-in ${config.borderClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full ${config.iconBg} mb-4`}
          >
            {config.icon}
          </div>
          <h3
            id="notification-title"
            className="text-2xl font-bold text-slate-900"
          >
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-md text-slate-600">{message}</p>
            {count !== undefined && count > 1 && (
              <p className="text-sm text-slate-500 mt-1">
                Total: {count} items
              </p>
            )}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-1 sm:text-sm"
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <Link
            href={config.href}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${config.buttonClass} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm`}
            onClick={onNavigate}
          >
            {config.buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
};

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  onNotificationClick,
  onDismiss,
}) => {
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [currentNotification, setCurrentNotification] =
    useState<AppNotification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<AppNotification[]>(
    []
  );
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      // This would be your actual API call
      const response = await NotificationService.getAll();
      const { notifications: fetchedNotifications, counts: fetchedCounts } =
        response;
      setCounts(fetchedCounts);
      setNotificationQueue(fetchedNotifications);
    } catch (error) {}
  }, []);

  // Process notification queue one by one
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const [nextNotification, ...rest] = notificationQueue;
      setCurrentNotification(nextNotification);
      setNotificationQueue(rest);
    }
  }, [currentNotification, notificationQueue]);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (currentNotification) {
      const timer = setTimeout(() => {
        handleNotificationDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  const handleNotificationDismiss = useCallback(() => {
    if (currentNotification) {
      onDismiss?.(currentNotification);
      setCurrentNotification(null);
    }
  }, [currentNotification, onDismiss]);

  const handleNotificationNavigate = useCallback(() => {
    if (currentNotification) {
      onNotificationClick?.(currentNotification);
      setCurrentNotification(null);
    }
  }, [currentNotification, onNotificationClick]);

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (!currentNotification) {
    return null;
  }

  const count = counts[currentNotification.type];

  return (
    <NotificationModal
      notification={currentNotification}
      count={count}
      onDismiss={handleNotificationDismiss}
      onNavigate={handleNotificationNavigate}
      isSupervisor={user?.role === "SUPERVISOR"}
    />
  );
};

export default NotificationSystem;
