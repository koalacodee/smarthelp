"use client";
import React from "react";
import FAQActions from "./FAQActions";
import { GroupedFAQs, useGroupedFAQsStore } from "../store/useGroupedFAQsStore";
import { useEffect } from "react";
import { FAQService } from "@/lib/api/v2";
import RefreshButton from "@/components/ui/RefreshButton";
import { useFAQAttachments } from "@/lib/store/useAttachmentsStore";

export default function FaqsTable({
  questions,
  attachments,
}: {
  questions: GroupedFAQs[];
  attachments: Record<string, string[]>;
}) {
  const { filteredFaqs, setFAQs } = useGroupedFAQsStore();
  const { setFAQAttachments } = useFAQAttachments();

  useEffect(() => {
    setFAQs(questions);
    setFAQAttachments(attachments);
  }, []);

  async function loadFAQs() {
    FAQService.getAllGroupedByDepartment().then((res) => {
      setFAQs(res.questions);
      setFAQAttachments(res.attachments);
    });
  }

  // Calculate total questions count
  const totalQuestions = filteredFaqs.reduce(
    (total, group) => total + group.questions.length,
    0
  );

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                FAQ Database
              </h2>
              <p className="text-sm text-slate-600">
                {totalQuestions} FAQ{totalQuestions !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
          <RefreshButton onRefresh={loadFAQs} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <tbody className="bg-white divide-y divide-slate-200">
            {totalQuestions === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-slate-500">
                      <p className="text-lg font-medium mb-2">No FAQs found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredFaqs.map((faq, groupIndex) =>
                faq.questions.length > 0 ? (
                  <React.Fragment key={faq.departmentId}>
                    {/* Department Header */}
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-b border-blue-200">
                      <td colSpan={6} className="px-6 py-3 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {faq.departmentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800">
                              {faq.departmentName}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {faq.questions.length} question
                              {faq.questions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Questions */}
                    {faq.questions.map((question, questionIndex) => (
                      <tr
                        key={question.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 border-b border-slate-100 last:border-b-0"
                        style={{
                          animationDelay: `${
                            groupIndex * 0.1 + questionIndex * 0.05
                          }s`,
                        }}
                      >
                        <td className="px-6 py-4 max-w-md">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p
                              className="text-sm text-slate-900 leading-relaxed"
                              title={question.text}
                            >
                              {question.text}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {question.departmentName ?? "Main Category"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span className="text-sm font-medium text-slate-600">
                              {question.views}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-green-500">👍</span>
                            <span className="text-sm font-medium text-slate-600">
                              {question.satisfaction}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-red-500">👎</span>
                            <span className="text-sm font-medium text-slate-600">
                              {question.dissatisfaction}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <FAQActions
                              questionId={question.id}
                              departmentId={faq.departmentId}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ) : null
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
