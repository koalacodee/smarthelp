import type { UUID } from "./UUID";

export interface UpdateQuestionRequest {
  text?: string;
  answer?: string;
  departmentId?: UUID;
  knowledgeChunkId?: UUID;
  attach?: boolean;
  deleteAttachments?: UUID[];
  chooseAttachments?: UUID[];
}
