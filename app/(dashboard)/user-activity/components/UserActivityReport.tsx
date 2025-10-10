"use client";
import Briefcase from "@/icons/Briefcase";
import CheckCircle from "@/icons/CheckCircle";
import ChevronDown from "@/icons/ChevronDown";
import ClipboardList from "@/icons/ClipboardList";
import Megaphone from "@/icons/Megaphone";
import Ticket from "@/icons/Ticket";
import UserPlus from "@/icons/UserPlus";
import React, { useState } from "react";

type ActivityItem = {
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
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-6 bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-150/50 transition-all duration-300 rounded-t-2xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            {React.cloneElement(icon as React.ReactElement, {
              className: "w-5 h-5 text-white",
            })}
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
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
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
  const groups = report.data.data;

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
        header: "User",
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: "Ticket ID",
        accessor: (item: ActivityItem) => (
          <span className="font-mono text-xs">{item.meta.code}</span>
        ),
      },
      {
        header: "Subject",
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: "Response Time",
        accessor: (item: ActivityItem) => {
          const repliedInSeconds = item.meta.repliedInSeconds;
          if (!repliedInSeconds)
            return <span className="text-slate-400">N/A</span>;

          return (
            <span className="font-semibold text-slate-700">
              {formatResponseTime(repliedInSeconds)}
            </span>
          );
        },
        className: "text-center",
      },
      {
        header: "Rating",
        accessor: (item: ActivityItem) => {
          const rating = item.meta.rating;
          if (!rating) return <span className="text-slate-400">N/A</span>;

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
              {rating === "SATISFACTION" ? "👍 Satisfied" : "👎 Dissatisfied"}
            </span>
          );
        },
        className: "text-center",
      },
      {
        header: "Date Answered",
        accessor: (item: ActivityItem) =>
          new Date(item.occurredAt).toLocaleDateString(),
        className: "text-center",
      },
    ],
    task_performed: [
      {
        header: "User",
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: "Task Title",
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: "Completion Time",
        accessor: (item: ActivityItem) => {
          const performedInSeconds = item.meta.performedInSeconds;
          if (!performedInSeconds)
            return <span className="text-slate-400">N/A</span>;

          return (
            <span className="font-semibold text-slate-700">
              {formatResponseTime(performedInSeconds)}
            </span>
          );
        },
        className: "text-center",
      },
      {
        header: "Status",
        accessor: (item: ActivityItem) => (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {item.meta.status?.replace("_", " ") || "N/A"}
          </span>
        ),
        className: "text-center",
      },
      {
        header: "Date Submitted",
        accessor: (item: ActivityItem) =>
          new Date(item.occurredAt).toLocaleDateString(),
        className: "text-center",
      },
    ],
    task_approved: [
      {
        header: "User",
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: "Task Title",
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: "Date Approved",
        accessor: (item: ActivityItem) =>
          new Date(item.occurredAt).toLocaleDateString(),
      },
    ],
    faq_created: [
      {
        header: "User",
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: "Question",
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: "Date Created",
        accessor: (item: ActivityItem) =>
          new Date(item.occurredAt).toLocaleDateString(),
      },
    ],
    faq_updated: [
      {
        header: "User",
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: "Question",
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: "Date Updated",
        accessor: (item: ActivityItem) =>
          new Date(item.occurredAt).toLocaleDateString(),
      },
    ],
    promotion_created: [
      {
        header: "User",
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: "Title",
        accessor: (item: ActivityItem) => item.title,
        className: "max-w-xs truncate",
      },
      {
        header: "Audience",
        accessor: (item: ActivityItem) => (
          <span className="capitalize">{item.meta.audience || "N/A"}</span>
        ),
      },
      {
        header: "Date Created",
        accessor: (item: ActivityItem) =>
          new Date(item.occurredAt).toLocaleDateString(),
      },
    ],
    staff_request_created: [
      {
        header: "User",
        accessor: (item: ActivityItem) => (
          <span className="font-semibold">{item.user.name}</span>
        ),
      },
      {
        header: "Requested User",
        accessor: (item: ActivityItem) => item.title,
      },
      {
        header: "Status",
        accessor: (item: ActivityItem) => (
          <span className="capitalize">{item.meta.status || "N/A"}</span>
        ),
      },
      {
        header: "Date",
        accessor: (item: ActivityItem) =>
          new Date(item.occurredAt).toLocaleDateString(),
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <ActivitySection
          title="Answered Tickets"
          icon={<Ticket className="w-6 h-6 text-blue-500" />}
          items={answeredTickets}
          columns={columns.ticket_answered}
          emptyMessage="No tickets answered."
        />
        <ActivitySection
          title="Tasks Performed"
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          items={performedTasks}
          columns={columns.task_performed}
          emptyMessage="No tasks performed."
        />
        <ActivitySection
          title="Tasks Approved"
          icon={<Briefcase className="w-6 h-6 text-purple-500" />}
          items={approvedTasks}
          columns={columns.task_approved}
          emptyMessage="No tasks approved."
        />
        <ActivitySection
          title="FAQs Created"
          icon={<ClipboardList className="w-6 h-6 text-yellow-500" />}
          items={createdFaqs}
          columns={columns.faq_created}
          emptyMessage="No FAQs created."
        />
        <ActivitySection
          title="FAQs Updated"
          icon={<ClipboardList className="w-6 h-6 text-yellow-500" />}
          items={updatedFaqs}
          columns={columns.faq_updated}
          emptyMessage="No FAQs updated."
        />
        <ActivitySection
          title="Promotions Created"
          icon={<Megaphone className="w-6 h-6 text-pink-500" />}
          items={createdPromotions}
          columns={columns.promotion_created}
          emptyMessage="No promotions created."
        />
        <ActivitySection
          title="Staff Requests Created"
          icon={<UserPlus className="w-6 h-6 text-indigo-500" />}
          items={createdStaffRequests}
          columns={columns.staff_request_created}
          emptyMessage="No staff requests created."
        />
      </div>
    </div>
  );
};

export default UserActivityReport;
