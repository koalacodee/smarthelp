"use client";

import api from "@/lib/api";
import { useGroupedFAQsStore } from "../store/useGroupedFAQsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useCurrentEditingFAQStore } from "../store/useCurrentEditingFAQ";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useMemo } from "react";
import { Question } from "@/lib/api/types";

export default function FAQActions({
  departmentId,
  questionId,
}: {
  departmentId: string;
  questionId: string;
}) {
  const { removeFAQ, faqs } = useGroupedFAQsStore();
  const { addToast } = useToastStore();
  const { openModal } = useConfirmationModalStore();
  const { setFaq, setIsEditing } = useCurrentEditingFAQStore();
  const { locale } = useLocaleStore();

  const flattedQuestions = useMemo(() => {
    const questions = [];
    for (const faq of faqs) {
      questions.push(
        ...faq.questions.map((question) => ({
          ...question,
          departmentId: question.departmentId ?? faq.departmentId,
        }))
      );
    }
    return questions;
  }, [faqs]);

  const question = flattedQuestions.find(
    (q) => q.id === questionId
  ) as Question;

  if (!locale) return null;

  return (
    <div className="flex items-center space-x-4">
      <button
        className="text-blue-600 hover:text-blue-900 transition-colors duration-200 font-medium"
        onClick={() => {
          setFaq(question);
          setIsEditing(true);
        }}
      >
        {locale.faqs.actions.edit}
      </button>
      <button
        onClick={() =>
          openModal({
            title: locale?.faqs?.confirmations?.deleteTitle || "Delete FAQ",
            message:
              locale?.faqs?.confirmations?.deleteMessage ||
              "Are you sure you want to delete this FAQ?",
            confirmText: locale?.faqs?.confirmations?.confirmText || "Confirm",
            cancelText: locale?.faqs?.confirmations?.cancelText || "Cancel",
            onConfirm: () => {
              api.FAQsService.deleteQuestion(questionId).then(() => {
                removeFAQ(departmentId, questionId);
                addToast({
                  message: locale?.faqs?.toasts?.faqDeleted || "FAQ deleted",
                  type: "success",
                });
              });
            },
          })
        }
        className="text-red-600 hover:text-red-900 transition-colors duration-200 font-medium"
      >
        {locale.faqs.actions.delete}
      </button>
    </div>
  );
}
