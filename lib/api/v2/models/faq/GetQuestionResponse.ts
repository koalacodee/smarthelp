import type { AttachmentMap } from "./AttachmentMap";
import type { QuestionDTO } from "./QuestionDTO";

export interface GetQuestionResponse {
  question: QuestionDTO | null;
  attachments: AttachmentMap;
}
