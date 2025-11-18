// sdk-jsend-data-return.ts (hypothetical file - not actually created)
import type { AxiosInstance } from "axios";

/* ========== JSend Envelope ========== */
export interface JSendSuccess<T> {
  status: "success";
  data: T;
}

/* ========== Shared Types ========== */
export type IsoDateString = string;

/* ========== Activity (Recent Activity) ========== */
export type ActivityItemType = "ticket" | "task" | "faq" | "user" | "promotion";

export interface RecentActivityItem {
  id: string;
  type: ActivityItemType;
  description: string;
  timestamp: IsoDateString;
  meta: Record<string, any>;
}

export interface GetRecentActivityQuery {
  limit?: number; // default 10
}
export interface GetRecentActivityData {
  items: RecentActivityItem[];
}

/* ========== Employee Requests (Pending Preview) ========== */
export interface RequestedByPreview {
  id: string;
  name: string;
}
export interface PendingRequestItem {
  id: string;
  candidateName: string | null;
  requestedBy: RequestedByPreview | null;
  createdAt: IsoDateString;
}
export interface GetPendingRequestsQuery {
  limit?: number; // default 5
}
export interface GetPendingRequestsData {
  total: number;
  items: PendingRequestItem[];
}

/* ========== Dashboard: Summary ========== */
export interface DashboardSummaryData {
  totalUsers: number;
  activeTickets: number;
  completedTickets: number;
  completedTasks: number;
  pendingTasks: number;
  faqSatisfaction: number;
}

/* ========== Dashboard: Performance (Weekly) ========== */
export interface PerformanceSeriesPoint {
  label: string; // Mon/Tue/...
  tasksCompleted: number;
  ticketsClosed: number;
  avgFirstResponseSeconds: number;
}
export interface GetPerformanceQuery {
  range?: string; // '7d'
  departmentId?: string;
}
export interface GetPerformanceData {
  series: PerformanceSeriesPoint[];
}

/* ========== Dashboard: Analytics Summary ========== */
export interface AnalyticsKpi {
  label: string;
  value: string;
}
export interface DepartmentPerformanceItem {
  name: string;
  score: number; // 0..100
}
export interface GetAnalyticsSummaryQuery {
  range?: string; // '7d'
  departmentId?: string;
}
export interface GetAnalyticsSummaryData {
  kpis: AnalyticsKpi[];
  departmentPerformance: DepartmentPerformanceItem[];
}

/* ========== Dashboard: Overview (Unified) ========== */
export interface GetOverviewQuery {
  range?: string; // '7d'
  limit?: number; // 10
  departmentId?: string;
}
export interface ExpiredAttachment {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  expirationDate: string;
  userId: string | null;
  guestId: string | null;
  isGlobal: boolean;
  size: number;
  createdAt: string;
  updatedAt: string;
  targetId: string;
  cloned: boolean;
}

export interface GetOverviewData {
  summary: DashboardSummaryData;
  pendingRequests: GetPendingRequestsData;
  recentActivity: GetRecentActivityData;
  performance: GetPerformanceData;
  analyticsSummary: GetAnalyticsSummaryData;
  generatedAt: IsoDateString;
  expiredAttachments: ExpiredAttachment[];
}

/* ========== Services (methods return the unwrapped data) ========== */
export class ActivityService {
  constructor(private readonly http: AxiosInstance) {}

  async getRecent(
    query?: GetRecentActivityQuery
  ): Promise<GetRecentActivityData> {
    const res = await this.http.get<JSendSuccess<GetRecentActivityData>>(
      "/activity-log/recent",
      { params: { limit: query?.limit } }
    );
    return res.data.data;
  }
}

export class EmployeeRequestsService {
  constructor(private readonly http: AxiosInstance) {}

  async getPending(
    query?: GetPendingRequestsQuery
  ): Promise<GetPendingRequestsData> {
    const res = await this.http.get<JSendSuccess<GetPendingRequestsData>>(
      "/employee-requests/pending",
      { params: { limit: query?.limit } }
    );
    return res.data.data;
  }
}

export class DashboardService {
  constructor(private readonly http: AxiosInstance) {}

  async getSummary(
    query?: { departmentId?: string }
  ): Promise<DashboardSummaryData> {
    const res = await this.http.get<JSendSuccess<DashboardSummaryData>>(
      "/dashboard/summary",
      { params: { departmentId: query?.departmentId } }
    );
    return res.data.data;
  }

  async getPerformance(
    query?: GetPerformanceQuery
  ): Promise<GetPerformanceData> {
    const res = await this.http.get<JSendSuccess<GetPerformanceData>>(
      "/dashboard/performance",
      { params: { range: query?.range, departmentId: query?.departmentId } }
    );
    return res.data.data;
  }

  async getAnalyticsSummary(
    query?: GetAnalyticsSummaryQuery
  ): Promise<GetAnalyticsSummaryData> {
    const res = await this.http.get<JSendSuccess<GetAnalyticsSummaryData>>(
      "/dashboard/analytics-summary",
      { params: { range: query?.range, departmentId: query?.departmentId } }
    );
    return res.data.data;
  }

  async getOverview(query?: GetOverviewQuery): Promise<GetOverviewData> {
    const res = await this.http.get<JSendSuccess<GetOverviewData>>(
      "/dashboard/overview",
      {
        params: {
          range: query?.range,
          limit: query?.limit,
          departmentId: query?.departmentId,
        },
      }
    );
    return res.data.data;
  }
}

/* ========== Factories (Singleton Builders) ========== */
export interface Services {
  activity: ActivityService;
  employeeRequests: EmployeeRequestsService;
  dashboard: DashboardService;
}

export function createServices(http: AxiosInstance): Services {
  return {
    activity: new ActivityService(http),
    employeeRequests: new EmployeeRequestsService(http),
    dashboard: new DashboardService(http),
  };
}

export const createActivityService = (http: AxiosInstance) =>
  new ActivityService(http);
export const createEmployeeRequestsService = (http: AxiosInstance) =>
  new EmployeeRequestsService(http);
export const createDashboardService = (http: AxiosInstance) =>
  new DashboardService(http);
