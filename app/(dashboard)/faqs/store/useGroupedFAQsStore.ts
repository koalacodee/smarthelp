import { Question } from "@/lib/api/types";
import { create } from "zustand";
import { GroupedFAQsQuestion } from "../page";

export interface GroupedFAQs {
  departmentId: string;
  departmentName: string;
  questions: GroupedFAQsQuestion[];
}

export interface FAQFilters {
  search: string;
  department: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface GroupedFAQsState {
  faqs: GroupedFAQs[];
  filteredFaqs: GroupedFAQs[];
  filters: FAQFilters;
  setFAQs: (faqs: GroupedFAQs[]) => void;
  addFAQ: (departmentId: string, question: Question) => void;
  updateFAQ: (
    departmentId: string,
    questionId: string,
    updated: Partial<GroupedFAQsQuestion>
  ) => void;
  removeFAQ: (departmentId: string, questionId: string) => void;
  setFilters: (filters: Partial<FAQFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

export const useGroupedFAQsStore = create<GroupedFAQsState>((set, get) => ({
  faqs: [],
  filteredFaqs: [],
  filters: {
    search: "",
    department: "",
    sortBy: "text",
    sortOrder: "asc",
  },

  setFAQs: (faqs) => {
    set({ faqs, filteredFaqs: faqs });
    get().applyFilters();
  },

  addFAQ: (departmentId, question) => {
    set((state) => {
      const newFaqs = state.faqs.map((group) =>
        group.departmentId === departmentId
          ? { ...group, questions: [...group.questions, question] }
          : group
      );
      return { faqs: newFaqs };
    });
    // Trigger filtering to update filteredFaqs
    get().applyFilters();
  },

  updateFAQ: (departmentId, questionId, updated) => {
    set((state) => {
      // Find and update the FAQ in any group
      const newFaqs = state.faqs.map((group) => ({
        ...group,
        questions: group.questions.map((q) =>
          q.id === questionId ? { ...q, ...updated } : q
        ),
      }));
      return { faqs: newFaqs };
    });
    // Trigger filtering to update filteredFaqs
    get().applyFilters();
  },

  removeFAQ: (departmentId, questionId) => {
    set((state) => {
      const newFaqs = state.faqs.map((group) =>
        group.departmentId === departmentId
          ? {
              ...group,
              questions: group.questions.filter((q) => q.id !== questionId),
            }
          : group
      );
      return { faqs: newFaqs };
    });
    // Trigger filtering to update filteredFaqs
    get().applyFilters();
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { faqs, filters } = get();
    let filtered = [...faqs];

    // Search filter
    if (filters.search) {
      filtered = filtered
        .map((group) => ({
          ...group,
          questions: group.questions.filter(
            (question) =>
              question.text
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              question.departmentName
                ?.toLowerCase()
                .includes(filters.search.toLowerCase())
          ),
        }))
        .filter((group) => group.questions.length > 0);
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(
        (group) => group.departmentId === filters.department
      );
    }

    // Sort FAQs
    filtered = filtered.map((group) => ({
      ...group,
      questions: [...group.questions].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case "text":
            aValue = a.text.toLowerCase();
            bValue = b.text.toLowerCase();
            break;
          case "department":
            aValue = a.departmentName?.toLowerCase() || "";
            bValue = b.departmentName?.toLowerCase() || "";
            break;
          case "views":
            aValue = a.views || 0;
            bValue = b.views || 0;
            break;
          case "satisfaction":
            aValue = a.satisfaction || 0;
            bValue = b.satisfaction || 0;
            break;
          case "dissatisfaction":
            aValue = a.dissatisfaction || 0;
            bValue = b.dissatisfaction || 0;
            break;
          default:
            aValue = a.text.toLowerCase();
            bValue = b.text.toLowerCase();
        }

        if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
        return 0;
      }),
    }));

    set({ filteredFaqs: filtered });
  },

  clearFilters: () => {
    set({
      filters: {
        search: "",
        department: "",
        sortBy: "text",
        sortOrder: "asc",
      },
    });
    get().applyFilters();
  },
}));
