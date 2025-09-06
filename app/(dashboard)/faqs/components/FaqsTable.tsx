"use client";
import React from "react";
import { GroupedFAQs } from "../page";
import FAQActions from "./FAQActions";
import { useGroupedFAQsStore } from "../store/useGroupedFAQsStore";
import { useEffect } from "react";
import { FAQsService } from "@/lib/api";
import RefreshButton from "@/components/ui/RefreshButton";

export default function FaqsTable() {
  const { faqs: storedFaqs, setFAQs } = useGroupedFAQsStore();

  useEffect(() => {
    loadFAQs();
  }, []);

  async function loadFAQs() {
    FAQsService.getGrouped()
      .then((res) => res.data.data)
      .then(setFAQs);
  }

  return (
    <>
      <RefreshButton onRefresh={loadFAQs} />
      <table className="min-w-full divide-y divide-slate-200 overflow-auto">
        <thead className="bg-slate-100">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Question
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Sub-department
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Views
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
              title="Satisfied"
            >
              👍
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
              title="Dissatisfied"
            >
              👎
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {storedFaqs.map((faq) =>
            faq.questions.length > 0 ? (
              <React.Fragment key={faq.departmentId}>
                <tr className="bg-slate-50 border-t border-b border-slate-200">
                  <td
                    colSpan={6}
                    className="px-6 py-2 text-left text-sm font-semibold text-slate-800"
                  >
                    {faq.departmentName}
                  </td>
                </tr>
                {faq.questions.map((question) => (
                  <tr
                    key={question.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 max-w-md">
                      <p
                        className="text-sm text-slate-900 truncate"
                        title={question.text}
                      >
                        {question.text}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {question.departmentName ?? (
                        <span className="italic text-slate-400">
                          Main Category
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {question.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {question.satisfaction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {question.dissatisfaction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <FAQActions
                        questionId={question.id}
                        departmentId={faq.departmentId}
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ) : null
          )}
        </tbody>
      </table>
    </>
  );
}
