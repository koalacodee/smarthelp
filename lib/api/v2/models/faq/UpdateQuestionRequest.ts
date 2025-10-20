import type { UUID } from "./UUID";
import type { SupportedLanguage } from "@/types/translation";

export interface UpdateQuestionRequest {
  text?: string;
  answer?: string;
  departmentId?: UUID;
  knowledgeChunkId?: UUID;
  attach?: boolean;
  deleteAttachments?: UUID[];
  chooseAttachments?: UUID[];
  translateTo?: SupportedLanguage[];
}
