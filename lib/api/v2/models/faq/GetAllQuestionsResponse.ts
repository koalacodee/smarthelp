import type { AttachmentMap } from "./AttachmentMap";
import type { QuestionDTO } from "./QuestionDTO";

export interface GetAllQuestionsResponse {
  questions: QuestionDTO[];
  attachments: AttachmentMap;
}
