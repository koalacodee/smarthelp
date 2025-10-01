import type { UUID } from "./UUID";

export interface CreateQuestionRequest {
  text: string;
  departmentId: UUID;
  knowledgeChunkId?: UUID;
  answer?: string;
  attach?: boolean;
}
