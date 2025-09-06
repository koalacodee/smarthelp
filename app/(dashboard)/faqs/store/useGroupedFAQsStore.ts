import { Question } from "@/lib/api/types";
import { create } from "zustand";
import { GroupedFAQsQuestion } from "../page";

export interface GroupedFAQs {
  departmentId: string;
  departmentName: string;
  questions: GroupedFAQsQuestion[];
}

interface GroupedFAQsState {
  faqs: GroupedFAQs[];
  setFAQs: (faqs: GroupedFAQs[]) => void;
  addFAQ: (departmentId: string, question: Question) => void;
  updateFAQ: (
    departmentId: string,
    questionId: string,
    updated: Partial<GroupedFAQsQuestion>
  ) => void;
  removeFAQ: (departmentId: string, questionId: string) => void;
}

export const useGroupedFAQsStore = create<GroupedFAQsState>((set) => ({
  faqs: [],

  setFAQs: (faqs) => set({ faqs }),

  addFAQ: (departmentId, question) =>
    set((state) => ({
      faqs: state.faqs.map((group) =>
        group.departmentId === departmentId
          ? { ...group, questions: [...group.questions, question] }
          : group
      ),
    })),

  updateFAQ: (departmentId, questionId, updated) =>
    set((state) => ({
      faqs: state.faqs.map((group) =>
        group.departmentId === departmentId
          ? {
              ...group,
              questions: group.questions.map((q) =>
                q.id === questionId ? { ...q, ...updated } : q
              ),
            }
          : group
      ),
    })),

  removeFAQ: (departmentId, questionId) =>
    set((state) => ({
      faqs: state.faqs.map((group) =>
        group.departmentId === departmentId
          ? {
              ...group,
              questions: group.questions.filter((q) => q.id !== questionId),
            }
          : group
      ),
    })),
}));
