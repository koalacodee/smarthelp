import { create } from "zustand";
import { PromotionDTO } from "@/lib/api/v2/services/promotion";

interface CurrentEditingPromotionState {
  promotion: PromotionDTO | null;
  isEditing: boolean;
  setPromotion: (promotion: PromotionDTO | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useCurrentEditingPromotionStore =
  create<CurrentEditingPromotionState>((set) => ({
    promotion: null,
    isEditing: false,
    setPromotion: (promotion) => set({ promotion }),
    setIsEditing: (isEditing) => set({ isEditing }),
  }));
