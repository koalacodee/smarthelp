"use client";

import Link from "next/link";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface MyDelegationsHeaderProps {
  delegationCount?: number;
}

export default function MyDelegationsHeader({
  delegationCount = 0,
}: MyDelegationsHeaderProps) {
  const locale = useLocaleStore((state) => state.locale);
  if (!locale) return null;

  const countStr = locale.tasks.delegations?.pageHeader?.count
    ?.replace("{count}", delegationCount.toString())
    ?.replace("{plural}", delegationCount !== 1 ? "s" : "") ?? `${delegationCount} delegation(s) assigned`;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-purple-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {locale.tasks.delegations?.pageHeader?.title ?? locale.tasks.delegations?.pageTitle ?? "My Delegations"}
            </h2>
            <p className="text-sm text-slate-600">{countStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/v2/tasks/my-tasks"
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md"
          >
            {locale.tasks.myTasks?.tabs?.tasks ?? "My Tasks"}
          </Link>
          <Link
            href="/v2/tasks/my-delegations"
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
          >
            {locale.tasks.myTasks?.tabs?.myDelegations ?? "My Delegations"}
          </Link>
        </div>
      </div>
    </div>
  );
}
