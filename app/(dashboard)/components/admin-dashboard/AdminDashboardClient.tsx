"use client";

import { useState } from "react";
import DashboardCard from "./DashboardCard";
import CheckCircle from "@/icons/CheckCircle";
import Ticket from "@/icons/Ticket";
import User from "@/icons/User";
import ClipboardList from "@/icons/ClipboardList";
import QuickActionsPanel from "./QuickActionsPanel";
import BarChartPanel from "./BarChartPanel";
import AnalyticsSummary from "./AnalyticsSummary";
import RecentActivity from "./RecentActivity";
import ExpiredAttachments from "./ExpiredAttachments";
import DepartmentFilter from "./DepartmentFilter";
import AnimatedHeader from "./AnimatedHeader";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import {
  ActivityService,
  DashboardService,
  EmployeeRequestsService,
} from "@/lib/api/v2";
import {
  GetPendingRequestsData,
  GetRecentActivityData,
  GetPerformanceData,
  GetAnalyticsSummaryData,
  ExpiredAttachment,
} from "@/lib/api/v2/services/dashboard";

interface Department {
  id: string;
  name: string;
}

export interface AdminDashboardData {
  summary: {
    totalUsers: number;
    activeTickets: number;
    completedTickets: number;
    completedTasks: number;
    pendingTasks: number;
    faqSatisfaction: number;
    expiredAttachments: number;
  };
  pending: GetPendingRequestsData;
  recent: GetRecentActivityData;
  performance: GetPerformanceData;
  analyticsSummary: GetAnalyticsSummaryData;
  expiredAttachments: ExpiredAttachment[];
}

interface AdminDashboardClientProps {
  initialData: AdminDashboardData;
  departments: Department[];
}

async function fetchDashboardData(
  departmentId?: string
): Promise<AdminDashboardData> {
  try {
    const overview = await DashboardService.getOverview({
      range: "7d",
      limit: 10,
      departmentId,
    });

    return {
      summary: {
        ...overview.summary,
        expiredAttachments: overview.expiredAttachments.length,
      },
      pending: overview.pendingRequests,
      recent: overview.recentActivity,
      performance: overview.performance,
      analyticsSummary: overview.analyticsSummary,
      expiredAttachments: overview.expiredAttachments,
    };
  } catch (error) {
    const [s, p, r, perf, as] = await Promise.all([
      DashboardService.getSummary({ departmentId }),
      EmployeeRequestsService.getPending({ limit: 5 }),
      ActivityService.getRecent({ limit: 10 }),
      DashboardService.getPerformance({ range: "7d", departmentId }),
      DashboardService.getAnalyticsSummary({ range: "7d", departmentId }),
    ]);

    return {
      summary: { ...s, expiredAttachments: 0 },
      pending: p as GetPendingRequestsData,
      recent: r as GetRecentActivityData,
      performance: perf,
      analyticsSummary: as,
      expiredAttachments: [],
    };
  }
}

export default function AdminDashboardClient({
  initialData,
  departments,
}: AdminDashboardClientProps) {
  const [data, setData] = useState<AdminDashboardData>(initialData);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const { addToast } = useToastStore();

  const handleApplyFilter = async () => {
    setIsFiltering(true);
    try {
      const updatedData = await fetchDashboardData(
        selectedDepartment || undefined
      );
      setData(updatedData);
    } catch (error: any) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to filter dashboard data. Please try again.",
      });
    } finally {
      setIsFiltering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header + Filter */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex-1">
            <AnimatedHeader />
          </div>
          <DepartmentFilter
            departments={departments}
            selectedDepartment={selectedDepartment}
            onChange={setSelectedDepartment}
            onApply={handleApplyFilter}
            isLoading={isFiltering}
            className="lg:max-w-sm"
          />
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Users"
            value={data.summary.totalUsers}
            accentClassName="bg-indigo-500"
            borderGradient="from-indigo-400 via-indigo-500 to-indigo-600"
            iconGradient="from-indigo-50 to-indigo-100"
            icon={<User className="h-5 w-5" />}
            index={0}
          />
          <DashboardCard
            title="Active Tickets"
            value={data.summary.activeTickets}
            accentClassName="bg-amber-500"
            borderGradient="from-amber-400 via-yellow-500 to-amber-600"
            iconGradient="from-amber-50 to-yellow-100"
            icon={<Ticket className="h-5 w-5" />}
            index={1}
          />
          <DashboardCard
            title="Completed Tickets"
            value={data.summary.completedTickets}
            accentClassName="bg-amber-500"
            borderGradient="from-amber-400 via-yellow-500 to-amber-600"
            iconGradient="from-amber-50 to-yellow-100"
            icon={<Ticket className="h-5 w-5" />}
            index={2}
          />
          <DashboardCard
            title="Pending Tasks"
            value={data.summary.pendingTasks}
            accentClassName="bg-blue-500"
            borderGradient="from-blue-400 via-blue-500 to-blue-600"
            iconGradient="from-blue-50 to-blue-100"
            icon={<Ticket className="h-5 w-5" />}
            index={3}
          />
          <DashboardCard
            title="Completed Tasks"
            value={data.summary.completedTasks}
            accentClassName="bg-emerald-500"
            borderGradient="from-emerald-400 via-green-500 to-emerald-600"
            iconGradient="from-emerald-50 to-green-100"
            icon={<CheckCircle className="h-5 w-5" />}
            index={4}
          />
          <DashboardCard
            title="FAQ Satisfaction"
            value={`${data.summary.faqSatisfaction}%`}
            accentClassName="bg-purple-500"
            borderGradient="from-purple-400 via-purple-500 to-purple-600"
            iconGradient="from-purple-50 to-purple-100"
            icon={<ClipboardList className="h-5 w-5" />}
            index={5}
          />
          <DashboardCard
            title="Expired Attachments"
            value={`${data.summary.expiredAttachments}`}
            accentClassName="bg-red-500"
            borderGradient="from-red-400 via-red-500 to-red-600"
            iconGradient="from-red-50 to-red-100"
            icon={<ClipboardList className="h-5 w-5" />}
            index={6}
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsPanel />

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BarChartPanel
              title="Weekly Activity"
              data={data.performance.series.map((s) => ({
                day: s.label,
                tasks: s.tasksCompleted,
                tickets: s.ticketsClosed,
                avgResp: s.avgFirstResponseSeconds,
              }))}
            />
            <AnalyticsSummary
              kpis={data.analyticsSummary.kpis}
              departmentPerformance={
                data.analyticsSummary.departmentPerformance
              }
            />
            <ExpiredAttachments items={data.expiredAttachments} />
          </div>
          <div className="space-y-6">
            <RecentActivity items={data.recent.items} />
          </div>
        </div>
      </div>
    </div>
  );
}

