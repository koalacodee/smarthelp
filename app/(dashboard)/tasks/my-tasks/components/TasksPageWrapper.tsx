"use client";

import { useState } from "react";
import MyTasks from "./MyTasks";
import MyDelegationsPageClient from "./MyDelegationsPageClient";
import { MyTasksResponse } from "@/lib/api";

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
}

export default function TasksPageWrapper({
  tasksData,
  delegationsData,
  userRole,
}: TasksPageWrapperProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "delegations">("tasks");
  const isSupervisor = userRole === "SUPERVISOR";

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Only show for supervisors */}
      {isSupervisor && delegationsData && (
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "tasks"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab("delegations")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "delegations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Delegations
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
