"use client";

import api from "@/lib/api";
import { useGroupedFAQsStore } from "../store/useGroupedFAQsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useCurrentEditingFAQStore } from "../store/useCurrentEditingFAQ";
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

  const flattedQuestions = useMemo(() => {
    const questions = [];
    for (const faq of faqs) {
      questions.push(...faq.questions);
    }
    return questions;
  }, [faqs]);

  const question = flattedQuestions.find(
    (q) => q.id === questionId
  ) as Question;

  return (
    <div className="flex items-center space-x-4">
      <button
        className="text-blue-600 hover:text-blue-900 transition-colors duration-200 font-medium"
        onClick={() => {
          setFaq(question);
          setIsEditing(true);
        }}
      >
        Edit
      </button>
      <button
        onClick={() =>
          openModal({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this FAQ?",
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            onConfirm: () => {
              api.FAQsService.deleteQuestion(questionId).then(() => {
                removeFAQ(departmentId, questionId);
                addToast({
                  message: "FAQ Deleted Successfully!",
                  type: "success",
                });
              });
            },
          })
        }
        className="text-red-600 hover:text-red-900 transition-colors duration-200 font-medium"
      >
        Delete
      </button>
    </div>
  );
}
