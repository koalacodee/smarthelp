import type { AxiosInstance } from "axios";
import type { JSend } from "../models/jsend";

/* =========================
   Request/Response Contracts
   ========================= */

export interface EmployeeDashboardSummaryResponse {
  completedTasks: number;
  closedTickets: number;
  expiredFiles: number;
}

export interface EmployeePendingTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePendingTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  code: string;
}

export interface EmployeeExpiredFile {
  id: string;
  filename: string;
  originalName: string;
  type: string;
  size: number;
  expirationDate: string;
  createdAt: string;
}

export interface EmployeeDashboardResponse {
  summary: EmployeeDashboardSummaryResponse;
  pendingTasks: EmployeePendingTask[];
  pendingTickets: EmployeePendingTicket[];
  expiredFiles: EmployeeExpiredFile[];
}

export interface GetEmployeeDashboardRequest {
  taskLimit?: number;
  ticketLimit?: number;
}

/* =========================
   Service Singleton
   ========================= */

export class EmployeeDashboardService {
  private static instances = new WeakMap<AxiosInstance, EmployeeDashboardService>();

  private constructor(private readonly http: AxiosInstance) { }

  static getInstance(http: AxiosInstance): EmployeeDashboardService {
    let inst = EmployeeDashboardService.instances.get(http);
    if (!inst) {
      inst = new EmployeeDashboardService(http);
      EmployeeDashboardService.instances.set(http, inst);
    }
    return inst;
  }

  // GET /dashboard/employee/summary
  async getSummary(): Promise<EmployeeDashboardSummaryResponse> {
    const { data } = await this.http.get<JSend<EmployeeDashboardSummaryResponse>>(
      "/dashboard/employee/summary"
    );
    return data.data;
  }

  // GET /dashboard/employee
  async getDashboard(
    params: GetEmployeeDashboardRequest = {}
  ): Promise<EmployeeDashboardResponse> {
    const { data } = await this.http.get<JSend<EmployeeDashboardResponse>>(
      "/dashboard/employee",
      { params }
    );
    return data.data;
  }
}

/* =========================
   Factory
   ========================= */

export function createEmployeeDashboardService(
  http: AxiosInstance
): EmployeeDashboardService {
  return EmployeeDashboardService.getInstance(http);
}