import { createEntityStore } from "./useEntityStore";
import { Department } from "@/lib/api/departments";

export const useDepartmentStore = createEntityStore<Department>(
  "department-store",
  {
    persist: true,
    partialize: (state) => ({
      entities: state.entities,
    }),
  }
);
