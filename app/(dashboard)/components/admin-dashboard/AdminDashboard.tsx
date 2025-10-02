import {
  ActivityService,
  DashboardService,
  EmployeeRequestsService,
} from "@/lib/api/v2";
import DashboardCard from "./DashboardCard";
import CheckCircle from "@/icons/CheckCircle";
import Ticket from "@/icons/Ticket";
import User from "@/icons/User";
import ClipboardList from "@/icons/ClipboardList";
import QuickActionsPanel from "./QuickActionsPanel";
import BarChartPanel from "./BarChartPanel";
import AnalyticsSummary from "./AnalyticsSummary";
import PendingStaffRequests from "./PendingStaffRequests";
import RecentActivity from "./RecentActivity";
import AnimatedHeader from "./AnimatedHeader";

export default async function AdminDashboard() {
  // Fetch unified overview; if unavailable, fall back to individual calls
  let summary: {
    totalUsers: number;
    activeTickets: number;
    completedTasks: number;
    faqSatisfaction: number;
  } = {
    totalUsers: 0,
    activeTickets: 0,
    completedTasks: 0,
    faqSatisfaction: 0,
  };
  let pending = {
    total: 0,
    items: [] as {
      id: string;
      candidateName: string | null;
      requestedBy: { id: string; name: string } | null;
      createdAt: string;
    }[],
  };
  let recent = {
    items: [] as {
      id: string;
      type: "task" | "ticket" | "faq" | "user" | "promotion";
      description: string;
      timestamp: string;
      meta?: Record<string, any>;
    }[],
  };
  let performance = {
    series: [] as {
      label: string;
      tasksCompleted: number;
      ticketsClosed: number;
      avgFirstResponseSeconds: number;
    }[],
  };
  let analyticsSummary = {
    kpis: [] as { label: string; value: string }[],
    departmentPerformance: [] as { name: string; score: number }[],
  };

  try {
    const overview = await DashboardService.getOverview({
      range: "7d",
      limit: 10,
    });
    summary = overview.summary;
    pending = overview.pendingRequests;
    recent = overview.recentActivity;
    performance = overview.performance;
    analyticsSummary = overview.analyticsSummary;
  } catch {
    const [s, p, r, perf, as] = await Promise.all([
      DashboardService.getSummary(),
      EmployeeRequestsService.getPending({ limit: 5 }),
      ActivityService.getRecent({ limit: 10 }),
      DashboardService.getPerformance({ range: "7d" }),
      DashboardService.getAnalyticsSummary({ range: "7d" }),
    ]);
    summary = s;
    pending = p as any;
    recent = r as any;
    performance = perf;
    analyticsSummary = as;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <AnimatedHeader />

        {/* Metrics cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Users"
            value={summary.totalUsers}
            accentClassName="bg-indigo-500"
            icon={<User className="h-5 w-5" />}
            index={0}
          />
          <DashboardCard
            title="Active Tickets"
            value={summary.activeTickets}
            accentClassName="bg-blue-500"
            icon={<Ticket className="h-5 w-5" />}
            index={1}
          />
          <DashboardCard
            title="Completed Tasks"
            value={summary.completedTasks}
            accentClassName="bg-emerald-500"
            icon={<CheckCircle className="h-5 w-5" />}
            index={2}
          />
          <DashboardCard
            title="FAQ Satisfaction"
            value={`${summary.faqSatisfaction}%`}
            accentClassName="bg-amber-500"
            icon={<ClipboardList className="h-5 w-5" />}
            index={3}
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsPanel />

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BarChartPanel
              title="Weekly Activity"
              data={performance.series.map((s) => ({
                day: s.label,
                tasks: s.tasksCompleted,
                tickets: s.ticketsClosed,
                avgResp: s.avgFirstResponseSeconds,
              }))}
            />
            <AnalyticsSummary
              kpis={analyticsSummary.kpis}
              departmentPerformance={analyticsSummary.departmentPerformance}
            />
          </div>
          <div className="space-y-6">
            <PendingStaffRequests items={pending.items} total={pending.total} />
            <RecentActivity items={recent.items} />
          </div>
        </div>
      </div>
    </div>
  );
}
