"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DashboardCard from "../admin-dashboard/DashboardCard";
import CheckCircle from "@/icons/CheckCircle";
import Ticket from "@/icons/Ticket";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import ClipboardList from "@/icons/ClipboardList";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import type {
  EmployeeDashboardResponse,
  EmployeePendingTask,
  EmployeePendingTicket,
} from "@/lib/api/v2/services/employee-dash";

interface EmployeeDashboardContentProps {
  data: EmployeeDashboardResponse;
  locale: Locale;
  language: string;
}

export default function EmployeeDashboardContent({
  data,
  locale,
  language,
}: EmployeeDashboardContentProps) {
  const { setLocale } = useLocaleStore();

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);

  const { locale: storeLocale } = useLocaleStore();
  if (!storeLocale) return null;

  const quickActions = [
    {
      label: storeLocale.dashboard.employee.quickActions.myTasks,
      href: "/tasks/my-tasks",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      label: storeLocale.dashboard.employee.quickActions.myTickets,
      href: "/tickets",
      icon: <Ticket className="h-4 w-4" />,
    },
    {
      label: storeLocale.dashboard.employee.quickActions.myFiles,
      href: "/files",
      icon: <DocumentDuplicate className="h-4 w-4" />,
    },
    {
      label: storeLocale.dashboard.employee.quickActions.addFaq,
      href: "/faqs",
      icon: <ClipboardList className="h-4 w-4" />,
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />
          <div className="relative rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl ">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-3xl font-bold text-transparent"
                >
                  {storeLocale.dashboard.employee.header.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-slate-600"
                >
                  {storeLocale.dashboard.employee.header.description}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Completed/Closed Counts */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title={storeLocale.dashboard.employee.metrics.completedTasks}
            value={data.summary.completedTasks}
            accentClassName="bg-emerald-500"
            icon={<CheckCircle className="h-5 w-5" />}
            index={0}
          />
          <DashboardCard
            title={storeLocale.dashboard.employee.metrics.closedTickets}
            value={data.summary.closedTickets}
            accentClassName="bg-blue-500"
            icon={<Ticket className="h-5 w-5" />}
            index={1}
          />
          <DashboardCard
            title={storeLocale.dashboard.employee.metrics.expiredFiles}
            value={data.summary.expiredFiles}
            accentClassName="bg-amber-500"
            icon={<DocumentDuplicate className="h-5 w-5" />}
            index={2}
          />
        </div>

        {/* Main Grid: Pending Lists */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending Tasks List */}
          <PendingTasksList tasks={data.pendingTasks} />

          {/* Pending Tickets List */}
          <PendingTicketsList tickets={data.pendingTickets} />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-white/20 bg-white/90  shadow-xl p-5"
        >
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mb-4 text-base font-semibold text-slate-800"
          >
            {storeLocale.dashboard.employee.quickActions.title}
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.8 + index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md"
                >
                  <motion.span
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm group-hover:shadow"
                  >
                    {action.icon}
                  </motion.span>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PendingTasksList({ tasks }: { tasks: EmployeePendingTask[] }) {
  const { locale } = useLocaleStore();
  if (!locale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/90  shadow-xl p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="text-base font-semibold text-slate-800 flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4 text-blue-500" />
          {locale.dashboard.employee.pendingTasks.title} ({tasks.length})
        </motion.h3>
        <Link
          href="/tasks/my-tasks"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          {locale.dashboard.employee.pendingTasks.viewAll}
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500">
          {locale.dashboard.employee.pendingTasks.noTasks}
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const daysUntilDue = task.dueDate
              ? Math.ceil(
                  (new Date(task.dueDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;
            const isUrgent = daysUntilDue !== null && daysUntilDue <= 1;
            const priorityColors = {
              HIGH: "bg-red-100 text-red-800",
              MEDIUM: "bg-amber-100 text-amber-800",
              LOW: "bg-blue-100 text-blue-800",
            };
            const statusColors = {
              TODO: "bg-slate-100 text-slate-700",
              SEEN: "bg-blue-100 text-blue-700",
              PENDING_REVIEW: "bg-purple-100 text-purple-700",
            };

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 1 + index * 0.1,
                }}
                whileHover={{
                  backgroundColor: "rgb(248 250 252)",
                  transition: { duration: 0.2 },
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityColors[
                            task.priority as keyof typeof priorityColors
                          ] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[
                            task.status as keyof typeof statusColors
                          ] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      {daysUntilDue !== null && (
                        <span
                          className={`text-xs font-medium ${
                            isUrgent ? "text-red-600" : "text-slate-600"
                          }`}
                        >
                          {locale.dashboard.employee.pendingTasks.due}{" "}
                          {daysUntilDue > 0
                            ? `${daysUntilDue}d`
                            : locale.dashboard.employee.pendingTasks.today}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function PendingTicketsList({ tickets }: { tickets: EmployeePendingTicket[] }) {
  const { locale } = useLocaleStore();
  if (!locale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/90  shadow-xl p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="text-base font-semibold text-slate-800 flex items-center gap-2"
        >
          <Ticket className="h-4 w-4 text-indigo-500" />
          {locale.dashboard.employee.pendingTickets.title} ({tickets.length})
        </motion.h3>
        <Link
          href="/tickets"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          {locale.dashboard.employee.pendingTickets.viewAll}
        </Link>
      </div>
      {tickets.length === 0 ? (
        <p className="text-sm text-slate-500">
          {locale.dashboard.employee.pendingTickets.noTickets}
        </p>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, index) => {
            const hoursAgo = Math.floor(
              (Date.now() - new Date(ticket.createdAt).getTime()) /
                (1000 * 60 * 60)
            );
            const priorityColors = {
              HIGH: "bg-red-100 text-red-800",
              MEDIUM: "bg-amber-100 text-amber-800",
              LOW: "bg-blue-100 text-blue-800",
            };
            const statusColors = {
              OPEN: "bg-green-100 text-green-800",
              IN_PROGRESS: "bg-blue-100 text-blue-800",
              PENDING: "bg-yellow-100 text-yellow-800",
            };

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 1.1 + index * 0.1,
                }}
                whileHover={{
                  backgroundColor: "rgb(248 250 252)",
                  transition: { duration: 0.2 },
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {ticket.subject}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityColors[
                            ticket.priority as keyof typeof priorityColors
                          ] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[
                            ticket.status as keyof typeof statusColors
                          ] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {hoursAgo === 0
                          ? locale.dashboard.employee.pendingTickets.justNow
                          : locale.dashboard.employee.pendingTickets.hoursAgo.replace(
                              "{hours}",
                              hoursAgo.toString()
                            )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
