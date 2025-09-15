import { UserActivityService } from "@/lib/api";
import Link from "next/link";

export const revalidate = 1;

export default async function Home() {
  const overview = await UserActivityService.getAnalyticsOverview();
  console.log(overview);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow space-y-8">
        <h3 className="text-xl font-bold text-slate-800">
          Analytics & Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-slate-500 text-sm font-medium">
              FAQ Satisfaction
            </h4>
            <p className="text-3xl font-bold mt-1 text-slate-400">
              {overview.faqSatisfactionRate.toFixed(0)}%
            </p>
          </div>
          <Link
            href="/tickets"
            className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            aria-label="View 1 pending tickets"
          >
            <h4 className="text-slate-500 text-sm font-medium">
              Pending Tickets
            </h4>
            <p className="text-3xl font-bold mt-1 text-blue-600">
              {overview.openTicketsCount}
            </p>
          </Link>
          <Link
            href="/tickets"
            className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left hover:bg-amber-50 hover:border-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            aria-label="View 0 answered tickets pending closure"
          >
            <h4 className="text-slate-500 text-sm font-medium">
              Answered (Pending Closure)
            </h4>
            <p className="text-3xl font-bold mt-1 text-amber-600">
              {overview.answeredPendingClosureCount}
            </p>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">
              Category Performance by Views
            </h4>
            <div className="space-y-3">
              {overview.categoryViews.reverse().map((view, idx) => (
                <div className="group" key={idx}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-slate-600">
                      {view.categoryName}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {view.views} views
                    </span>
                  </div>
                  <div className="bg-slate-200 rounded-full h-2.5 w-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                      title="0 views"
                      style={{
                        width: `${(view.views / overview.totalViews) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-slate-700">
                Top Performing FAQs
              </h4>
            </div>
            <ul className="space-y-2">
              {overview.topFaqs.map((faq, idx) => (
                <li
                  className="text-sm flex justify-between items-center bg-slate-50 p-3 rounded-md"
                  key={idx}
                >
                  <div className="min-w-0">
                    <p
                      className="text-slate-800 font-medium truncate"
                      title="What are your shipping options?"
                    >
                      {faq.question}
                    </p>
                    <p className="text-xs text-slate-500">{faq.categoryName}</p>
                  </div>
                  <span className="font-bold text-slate-800 flex-shrink-0 ml-4">
                    {faq.viewCount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
