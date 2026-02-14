"use client";

// import { ChevronDown } from 'lucide-react';
import ChevronDown from "@/icons/ChevronDown";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";

interface FeedbackCollapsibleProps {
  taskId: string;
  rejectionReason?: string;
  approvalFeedback?: string;
  locale: {
    rejectionLabel: string;
    approvalLabel: string;
  };
}

export default function FeedbackCollapsible({
  taskId,
  rejectionReason,
  approvalFeedback,
  locale,
}: FeedbackCollapsibleProps) {
  const { expandedFeedback, toggleFeedback } = useV2TaskPageStore();
  const isExpanded = expandedFeedback.has(taskId);

  if (!rejectionReason && !approvalFeedback) return null;

  return (
    <>
      {rejectionReason && (
        <div className="mt-3 border border-red-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFeedback(`${taskId}-rejection`)}
            className="w-full flex items-center justify-between px-3 py-2 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <span className="text-sm font-medium text-red-800">
              {locale.rejectionLabel}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-red-600 transition-transform ${
                expandedFeedback.has(`${taskId}-rejection`) ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedFeedback.has(`${taskId}-rejection`) && (
            <div className="px-3 py-2 bg-white border-t border-red-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {rejectionReason}
              </p>
            </div>
          )}
        </div>
      )}

      {approvalFeedback && (
        <div className="mt-3 border border-green-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFeedback(`${taskId}-approval`)}
            className="w-full flex items-center justify-between px-3 py-2 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <span className="text-sm font-medium text-green-800">
              {locale.approvalLabel}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-green-600 transition-transform ${
                expandedFeedback.has(`${taskId}-approval`) ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedFeedback.has(`${taskId}-approval`) && (
            <div className="px-3 py-2 bg-white border-t border-green-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {approvalFeedback}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
