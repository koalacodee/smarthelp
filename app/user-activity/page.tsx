import { UserActivityService } from "@/lib/api";
import UserActivityReport from "./components/UserActivityReport";

export default async function Page({}) {
  const report = await UserActivityService.getUserActivity();

  return <UserActivityReport report={report.data} />;
}
