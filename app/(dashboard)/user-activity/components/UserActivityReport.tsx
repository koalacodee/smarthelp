"use client";
import Briefcase from "@/icons/Briefcase";
import CheckCircle from "@/icons/CheckCircle";
import ChevronDown from "@/icons/ChevronDown";
import ClipboardList from "@/icons/ClipboardList";
import Megaphone from "@/icons/Megaphone";
import Ticket from "@/icons/Ticket";
import UserPlus from "@/icons/UserPlus";
import React, { useState } from "react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

export type ActivityItem = {
  id: string;
  title: string;
  itemId: string;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  occurredAt: string;
  userId: string;
  user: { id: string; name: string; employeeId: string };
};

type ActivityGroup = {
  type: string;
  activities: ActivityItem[];
};

export type ApiResponse = {
  status: string;
  data: { data: ActivityGroup[] };
};

interface UserActivityReportProps {
  report: ApiResponse;
}

const formatResponseTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }
};

const ActivitySection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: ActivityItem[];
  columns: {
    header: string;
    accessor: (item: ActivityItem) => React.ReactNode;
    className?: string;
  }[];
  emptyMessage: string;
}> = ({ title, icon, items, columns, emptyMessage }) => {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0 || !locale) return null;

  return (
    <div className="bg-white/50  rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-6 bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-150/50 transition-all duration-300 rounded-t-2xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-5 h-5 text-white">{icon}</div>
          </div>
          <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-md">
            {items.length}
          </span>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4">
          <div className="overflow-x-auto">
            <div className="bg-white/70  rounded-xl border border-slate-200/50 shadow-sm">
              <table className="min-w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.header}
                        scope="col"
                        className={`px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                          col.className || ""
                        }`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors duration-200"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.header}
                          className={`px-6 py-4 text-sm text-slate-700 align-top ${
                            col.className || ""
                          }`}
                        >
                          {col.accessor(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserActivityReport: React.FC<UserActivityReportProps> = ({ report }) => {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const groups = report.data.data;

  if (!locale) return null;

  const answeredTickets =
    groups.find((g) => g.type === "ticket_answered")?.activities || [];
  const performedTasks =
    groups.find((g) => g.type === "task_performed")?.activities || [];
  const approvedTasks =
    groups.find((g) => g.type === "task_approved")?.activities || [];
  const createdFaqs =
    groups.find((g) => g.type === "faq_created")?.activities || [];
  const updatedFaqs =
    groups.find((g) => g.type === "faq_updated")?.activities || [];
  const createdPromotions =
    groups.find((g) => g.type === "promotion_created")?.activities || [];
  const createdStaffRequests =
    groups.find((g) => g.type === "staff_request_created")?.activities || [];

  const columns = {
    ticket_answered: [
      {
        header: locale.userActivity.activityReport.columns.user,
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.ticketId,
        accessor: (item: ActivityItem) => (
          <span className="font-mono text-xs">{item.meta.code}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.subject,
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: locale.userActivity.activityReport.columns.responseTime,
        accessor: (item: ActivityItem) => {
          const repliedInSeconds = item.meta.repliedInSeconds;
          if (!repliedInSeconds)
            return <span className="text-slate-400">{locale.userActivity.activityReport.columns.notAvailable}</span>;

          return (
            <span className="font-semibold text-slate-700">
              {formatResponseTime(repliedInSeconds)}
            </span>
          );
        },
        className: "text-center",
      },
      {
        header: locale.userActivity.activityReport.columns.rating,
        accessor: (item: ActivityItem) => {
          const rating = item.meta.rating;
          if (!rating) return <span className="text-slate-400">{locale.userActivity.activityReport.columns.notAvailable}</span>;

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                rating === "SATISFACTION"
                  ? "bg-green-100 text-green-800"
                  : rating === "DISSATISFACTION"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {rating === "SATISFACTION" ? locale.userActivity.activityReport.columns.satisfied : locale.userActivity.activityReport.columns.dissatisfied}
            </span>
          );
        },
        className: "text-center",
      },
      {
        header: locale.userActivity.activityReport.columns.dateAnswered,
        accessor: (item: ActivityItem) =>
          formatDateWithHijri(item.occurredAt, language),
        className: "text-center",
      },
    ],
    task_performed: [
      {
        header: locale.userActivity.activityReport.columns.user,
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.taskTitle,
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: locale.userActivity.activityReport.columns.completionTime,
        accessor: (item: ActivityItem) => {
          const performedInSeconds = item.meta.performedInSeconds;
          if (!performedInSeconds)
            return <span className="text-slate-400">{locale.userActivity.activityReport.columns.notAvailable}</span>;

          return (
            <span className="font-semibold text-slate-700">
              {formatResponseTime(performedInSeconds)}
            </span>
          );
        },
        className: "text-center",
      },
      {
        header: locale.userActivity.activityReport.columns.status,
        accessor: (item: ActivityItem) => (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {item.meta.status?.replace("_", " ") || locale.userActivity.activityReport.columns.notAvailable}
          </span>
        ),
        className: "text-center",
      },
      {
        header: locale.userActivity.activityReport.columns.dateSubmitted,
        accessor: (item: ActivityItem) =>
          formatDateWithHijri(item.occurredAt, language),
        className: "text-center",
      },
    ],
    task_approved: [
      {
        header: locale.userActivity.activityReport.columns.user,
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.taskTitle,
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: locale.userActivity.activityReport.columns.dateApproved,
        accessor: (item: ActivityItem) =>
          formatDateWithHijri(item.occurredAt, language),
      },
    ],
    faq_created: [
      {
        header: locale.userActivity.activityReport.columns.user,
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.question,
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: locale.userActivity.activityReport.columns.dateCreated,
        accessor: (item: ActivityItem) =>
          formatDateWithHijri(item.occurredAt, language),
      },
    ],
    faq_updated: [
      {
        header: locale.userActivity.activityReport.columns.user,
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.question,
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: locale.userActivity.activityReport.columns.dateUpdated,
        accessor: (item: ActivityItem) =>
          formatDateWithHijri(item.occurredAt, language),
      },
    ],
    promotion_created: [
      {
        header: locale.userActivity.activityReport.columns.user,
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.title,
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: locale.userActivity.activityReport.columns.audience,
        accessor: (item: ActivityItem) => (
          <span className="capitalize">{item.meta.audience || locale.userActivity.activityReport.columns.notAvailable}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.dateCreated,
        accessor: (item: ActivityItem) =>
          formatDateWithHijri(item.occurredAt, language),
      },
    ],
    staff_request_created: [
      {
        header: locale.userActivity.activityReport.columns.user,
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.requestedUser,
        accessor: (item: ActivityItem) => item.title,
      },
      {
        header: locale.userActivity.activityReport.columns.status,
        accessor: (item: ActivityItem) => (
          <span className="capitalize">{item.meta.status || locale.userActivity.activityReport.columns.notAvailable}</span>
        ),
      },
      {
        header: locale.userActivity.activityReport.columns.date,
        accessor: (item: ActivityItem) =>
          formatDateWithHijri(item.occurredAt, language),
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <ActivitySection
          title={locale.userActivity.activityReport.sections.answeredTickets}
          icon={<Ticket className="w-6 h-6 text-blue-500" />}
          items={answeredTickets}
          columns={columns.ticket_answered}
          emptyMessage={locale.userActivity.activityReport.emptyMessages.answeredTickets}
        />
        <ActivitySection
          title={locale.userActivity.activityReport.sections.tasksPerformed}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          items={performedTasks}
          columns={columns.task_performed}
          emptyMessage={locale.userActivity.activityReport.emptyMessages.tasksPerformed}
        />
        <ActivitySection
          title={locale.userActivity.activityReport.sections.tasksApproved}
          icon={<Briefcase className="w-6 h-6 text-purple-500" />}
          items={approvedTasks}
          columns={columns.task_approved}
          emptyMessage={locale.userActivity.activityReport.emptyMessages.tasksApproved}
        />
        <ActivitySection
          title={locale.userActivity.activityReport.sections.faqsCreated}
          icon={<ClipboardList className="w-6 h-6 text-yellow-500" />}
          items={createdFaqs}
          columns={columns.faq_created}
          emptyMessage={locale.userActivity.activityReport.emptyMessages.faqsCreated}
        />
        <ActivitySection
          title={locale.userActivity.activityReport.sections.faqsUpdated}
          icon={<ClipboardList className="w-6 h-6 text-yellow-500" />}
          items={updatedFaqs}
          columns={columns.faq_updated}
          emptyMessage={locale.userActivity.activityReport.emptyMessages.faqsUpdated}
        />
        <ActivitySection
          title={locale.userActivity.activityReport.sections.promotionsCreated}
          icon={<Megaphone className="w-6 h-6 text-pink-500" />}
          items={createdPromotions}
          columns={columns.promotion_created}
          emptyMessage={locale.userActivity.activityReport.emptyMessages.promotionsCreated}
        />
        <ActivitySection
          title={locale.userActivity.activityReport.sections.staffRequestsCreated}
          icon={<UserPlus className="w-6 h-6 text-indigo-500" />}
          items={createdStaffRequests}
          columns={columns.staff_request_created}
          emptyMessage={locale.userActivity.activityReport.emptyMessages.staffRequestsCreated}
        />
      </div>
    </div>
  );
};

export default UserActivityReport;
