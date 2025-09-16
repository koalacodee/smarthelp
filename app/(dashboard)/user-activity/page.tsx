import { UserActivityService } from "@/lib/api";
import UserActivityReport from "./components/UserActivityReport";
import UserPerformanceTable from "./components/UserPerformanceTable";

export default async function Page() {
  const report = await UserActivityService.getUserActivity();
  const performance = await UserActivityService.getPerformance();

  return (
    <div className="space-y-8">
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          User Performance Analytics
        </h2>
        <UserPerformanceTable
          users={performance.users}
          tickets={performance.tickets}
        />
      </div>
      <UserActivityReport report={report.data} />
    </div>
  );
}

export const revalidate = 1;
