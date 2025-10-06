import { create } from "zustand";
import { PromotionDTO, AudienceType } from "@/lib/api/v2/services/promotion";

export interface PromotionFilters {
  search: string;
  audience: string; // AudienceType or empty string for all
  status: string; // "active", "inactive", or "" for all
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface PromotionsState {
  promotions: PromotionDTO[];
  filteredPromotions: PromotionDTO[];
  filters: PromotionFilters;
  setPromotions: (promotions: PromotionDTO[]) => void;
  addPromotion: (promotion: PromotionDTO) => void;
  updatePromotion: (
    promotionId: string,
    updated: Partial<PromotionDTO>
  ) => void;
  removePromotion: (promotionId: string) => void;
  togglePromotionActive: (promotionId: string) => void;
  setFilters: (filters: Partial<PromotionFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

export const usePromotionsStore = create<PromotionsState>((set, get) => ({
  promotions: [],
  filteredPromotions: [],
  filters: {
    search: "",
    audience: "",
    status: "",
    sortBy: "title",
    sortOrder: "asc",
  },

  setPromotions: (promotions) => {
    set({ promotions, filteredPromotions: promotions });
    get().applyFilters();
  },

  addPromotion: (promotion) => {
    set((state) => ({
      promotions: [...state.promotions, promotion],
    }));
    get().applyFilters();
  },

  updatePromotion: (promotionId, updated) => {
    set((state) => ({
      promotions: state.promotions.map((p) =>
        p.id === promotionId ? { ...p, ...updated } : p
      ),
    }));
    get().applyFilters();
  },

  removePromotion: (promotionId) => {
    set((state) => ({
      promotions: state.promotions.filter((p) => p.id !== promotionId),
    }));
    get().applyFilters();
  },

  togglePromotionActive: (promotionId) => {
    set((state) => ({
      promotions: state.promotions.map((p) =>
        p.id === promotionId ? { ...p, isActive: !p.isActive } : p
      ),
    }));
    get().applyFilters();
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { promotions, filters } = get();
    let filtered = [...promotions];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter((promotion) =>
        promotion.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Audience filter
    if (filters.audience) {
      filtered = filtered.filter(
        (promotion) => (promotion.audience || "") === filters.audience
      );
    }

    // Status filter
    if (filters.status) {
      const isActive = filters.status === "active";
      filtered = filtered.filter(
        (promotion) => promotion.isActive === isActive
      );
    }

    // Sort promotions
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "audience":
          aValue = a.audience || "";
          bValue = b.audience || "";
          break;
        case "startDate":
          aValue = new Date(a.startDate || "").getTime();
          bValue = new Date(b.startDate || "").getTime();
          break;
        case "endDate":
          aValue = new Date(a.endDate || "").getTime();
          bValue = new Date(b.endDate || "").getTime();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || "").getTime();
          bValue = new Date(b.createdAt || "").getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    set({ filteredPromotions: filtered });
  },

  clearFilters: () => {
    set({
      filters: {
        search: "",
        audience: "",
        status: "",
        sortBy: "title",
        sortOrder: "asc",
      },
    });
    get().applyFilters();
  },
}));
