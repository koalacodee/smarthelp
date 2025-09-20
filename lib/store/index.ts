// Global stores
export { useAppStore } from "./useAppStore";

// Entity stores
export { useTaskStore } from "./useTaskStore";
export { useTicketStore } from "./useSupervisorStore";
export { useSupervisorStore } from "./useSupervisorStore";
export { useDepartmentStore } from "./useDepartmentStore";

// Store utilities
export { createEntityStore } from "./useEntityStore";
export {
  useHydrateStore,
  useHydrateStores,
  createHydratedStore,
} from "./hydration";

// Store types
export type { BaseEntity } from "./useEntityStore";
