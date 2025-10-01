import type { UUID } from "./UUID";

export interface ViewFaqsRequest {
  limit?: number;
  page?: number;
  departmentId?: UUID;
}
