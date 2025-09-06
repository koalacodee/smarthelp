import { create } from "zustand";
import { GroupedFAQsQuestion } from "../page";

interface CurrentEditingFaqState {
  faq: GroupedFAQsQuestion | null;
  isEditing: boolean;
  setFaq: (faq: GroupedFAQsQuestion | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useCurrentEditingFAQStore = create<CurrentEditingFaqState>(
  (set) => ({
    faq: null,
    isEditing: false,
    setFaq: (faq) => set({ faq }),
    setIsEditing: (isEditing) => set({ isEditing }),
  })
);
