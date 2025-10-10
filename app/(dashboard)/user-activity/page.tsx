import { Metadata } from "next";
import { UserActivityService } from "@/lib/api";
import AnimatedUserActivityPage from "./components/AnimatedUserActivityPage";

export const metadata: Metadata = {
  title: "User Activity | Performance Analytics",
  description:
    "Monitor user activity, performance metrics, and team productivity analytics",
};

export default async function Page() {
  const report = await UserActivityService.getUserActivity();
  const performance = await UserActivityService.getPerformance();

  return (
    <AnimatedUserActivityPage
      report={report.data}
      users={performance.users}
      tickets={performance.tickets}
    />
  );
}

export const revalidate = 1;
