"use client";

import { useState, useEffect } from "react";
import MyTasks from "./MyTasks";
import MyDelegationsPageClient from "./MyDelegationsPageClient";
import { MyTasksResponse } from "@/lib/api";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface TasksPageWrapperProps {
  tasksData: MyTasksResponse;
  delegationsData: {
    delegations: any[];
    submissions: any;
    attachments: any;
    delegationSubmissionAttachments: any;
    total: number;
    fileHubAttachments: any[];
  } | null;
  userRole: string;
  locale: Locale;
  language: string;
}

export default function TasksPageWrapper({
  tasksData,
  delegationsData,
  userRole,
  locale,
  language,
}: TasksPageWrapperProps) {
  const { setLocale } = useLocaleStore();
  const [activeTab, setActiveTab] = useState<"tasks" | "delegations">("tasks");
  const isSupervisor = userRole === "SUPERVISOR";
  const storeLocale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);

  if (!storeLocale) return null;

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Only show for supervisors */}
      {isSupervisor && delegationsData && (
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "tasks"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {storeLocale.tasks.myTasks.pageHeader.title}
            </button>
            <button
              onClick={() => setActiveTab("delegations")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "delegations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {storeLocale.tasks.delegations.pageHeader.title}
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "tasks" ? (
        <MyTasks data={tasksData} />
      ) : (
        delegationsData && (
          <MyDelegationsPageClient
            initialDelegations={delegationsData.delegations}
            initialSubmissions={delegationsData.submissions}
            initialAttachments={delegationsData.attachments}
            initialDelegationSubmissionAttachments={
              delegationsData.delegationSubmissionAttachments
            }
            initialTotal={delegationsData.total}
            initialFileHubAttachments={delegationsData.fileHubAttachments}
          />
        )
      )}
    </div>
  );
}
