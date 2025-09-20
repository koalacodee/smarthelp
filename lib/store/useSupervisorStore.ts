import { createEntityStore } from "./useEntityStore";
import { Datum as Supervisor } from "@/lib/api/supervisors";

export const useSupervisorStore = createEntityStore<Supervisor>(
  "supervisor-store",
  {
    persist: true,
    partialize: (state) => ({
      entities: state.entities,
    }),
  }
);
