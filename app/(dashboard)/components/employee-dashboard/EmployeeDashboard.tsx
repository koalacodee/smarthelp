import { EmployeeDashboardService } from "@/lib/api/v2";
import type { EmployeeDashboardResponse } from "@/lib/api/v2/services/employee-dash";
import EmployeeDashboardContent from "./EmployeeDashboardContent";

export default async function EmployeeDashboard() {
  let dashboardData: EmployeeDashboardResponse = {
    summary: {
      completedTasks: 0,
      closedTickets: 0,
      expiredFiles: 0,
    },
    pendingTasks: [],
    pendingTickets: [],
    expiredFiles: [],
  };

  try {
    dashboardData = await EmployeeDashboardService.getDashboard({
      taskLimit: 10,
      ticketLimit: 10,
    });
  } catch (error) {
    console.error("Failed to fetch employee dashboard data:", error);
    // Keep default empty data on error
  }

  return <EmployeeDashboardContent data={dashboardData} />;
}

