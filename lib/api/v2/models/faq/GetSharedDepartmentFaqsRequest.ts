import type { UUID } from "./UUID";

export interface GetSharedDepartmentFaqsRequest {
  key: string;
  subDepartmentId?: UUID;
}
