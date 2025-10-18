"use client";
import { useState, useEffect, useCallback } from "react";
import { AppNotification, NotificationService } from "../lib/api";

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

export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [currentNotification, setCurrentNotification] =
    useState<AppNotification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<AppNotification[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await NotificationService.getAll();
      const { notifications: fetchedNotifications, counts: fetchedCounts } =
        response;

      setNotifications(fetchedNotifications);
      setCounts(fetchedCounts);
      setNotificationQueue(fetchedNotifications);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setIsLoading(false);
    }
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
    setCurrentNotification(null);
  }, []);

  const handleNotificationNavigate = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  const getCurrentNotificationMessage = useCallback(() => {
    if (!currentNotification) return "";
    const count = counts[currentNotification.type];
    return generateNotificationMessage(currentNotification, count);
  }, [currentNotification, counts]);

  const getCurrentNotificationCount = useCallback(() => {
    if (!currentNotification) return 0;
    return counts[currentNotification.type] || 0;
  }, [currentNotification, counts]);

  // Load notifications on hook initialization
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    // State
    notifications,
    counts,
    currentNotification,
    isLoading,
    error,

    // Actions
    fetchNotifications,
    handleNotificationDismiss,
    handleNotificationNavigate,

    // Computed values
    getCurrentNotificationMessage,
    getCurrentNotificationCount,

    // Message generation utility
    generateNotificationMessage,
  };
};
