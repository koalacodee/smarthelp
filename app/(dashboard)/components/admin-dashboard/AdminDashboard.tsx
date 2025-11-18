import {
  ActivityService,
  DashboardService,
  EmployeeRequestsService,
} from "@/lib/api/v2";
import { DepartmentsService } from "@/lib/api";
import AdminDashboardClient, {
  AdminDashboardData,
} from "./AdminDashboardClient";

export default async function AdminDashboard() {
  // Fetch unified overview; if unavailable, fall back to individual calls
  let summary: AdminDashboardData["summary"] = {
    totalUsers: 0,
    activeTickets: 0,
    completedTickets: 0,
    pendingTasks: 0,
    completedTasks: 0,
    faqSatisfaction: 0,
    expiredAttachments: 0,
  };
  let pending: AdminDashboardData["pending"] = {
    total: 0,
    items: [],
  };
  let recent: AdminDashboardData["recent"] = {
    items: [],
  };
  let performance: AdminDashboardData["performance"] = {
    series: [],
  };
  let analyticsSummary: AdminDashboardData["analyticsSummary"] = {
    kpis: [] as { label: string; value: string }[],
    departmentPerformance: [] as { name: string; score: number }[],
  };
  let departments = [] as { id: string; name: string }[];
  let expiredAttachments: AdminDashboardData["expiredAttachments"] = [];

  try {
    const overview = await DashboardService.getOverview({
      range: "7d",
      limit: 10,
    });
    summary = {
      ...overview.summary,
      expiredAttachments: overview.expiredAttachments.length,
    };
    pending = overview.pendingRequests;
    recent = overview.recentActivity;
    performance = overview.performance;
    analyticsSummary = overview.analyticsSummary;
    expiredAttachments = overview.expiredAttachments;
    departments = await DepartmentsService.getAllDepartments();
  } catch {
    const [s, p, r, perf, as, depts] = await Promise.all([
      DashboardService.getSummary(),
      EmployeeRequestsService.getPending({ limit: 5 }),
      ActivityService.getRecent({ limit: 10 }),
      DashboardService.getPerformance({ range: "7d" }),
      DashboardService.getAnalyticsSummary({ range: "7d" }),
      DepartmentsService.getAllDepartments(),
    ]);
    summary = { ...s, expiredAttachments: 0 };
    pending = p as any;
    recent = r as any;
    performance = perf;
    analyticsSummary = as;
    departments = depts;
  }

  const initialData: AdminDashboardData = {
    summary,
    pending,
    recent,
    performance,
    analyticsSummary,
    expiredAttachments,
  };

  return (
    <AdminDashboardClient
      initialData={initialData}
      departments={departments}
    />
  );
}
