import { Metadata } from "next";
import { UserActivityService } from "@/lib/api";
import AnimatedUserActivityPage from "./components/AnimatedUserActivityPage";
import { getLocale, getLanguage } from "@/locales/helpers";

export const metadata: Metadata = {
  title: "User Activity | Performance Analytics",
  description:
    "Monitor user activity, performance metrics, and team productivity analytics",
};

export default async function Page() {
  const [locale, language, report, performance] = await Promise.all([
    getLocale(),
    getLanguage(),
    UserActivityService.getUserActivity(),
    UserActivityService.getPerformance(),
  ]);

  return (
    <AnimatedUserActivityPage
      report={report.data}
      users={performance.users}
      tickets={performance.tickets}
      locale={locale}
      language={language}
    />
  );
}

export const revalidate = 1;
