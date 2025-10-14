"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UserActivityFilters {
  search: string;
  role: string;
  activityType: string;
  dateRange: string;
}

interface UserActivityStore {
  filters: UserActivityFilters;
  setFilters: (filters: Partial<UserActivityFilters>) => void;
  clearFilters: () => void;
}

export const useUserActivityStore = create<UserActivityStore>()(
  devtools(
    (set) => ({
      filters: {
        search: "",
        role: "all",
        activityType: "all",
        dateRange: "all",
      },
      setFilters: (filters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...filters },
          }),
          false,
          "setFilters"
        ),
      clearFilters: () =>
        set(
          {
            filters: {
              search: "",
              role: "all",
              activityType: "all",
              dateRange: "all",
            },
          },
          false,
          "clearFilters"
        ),
    }),
    { name: "user-activity-store" }
  )
);
