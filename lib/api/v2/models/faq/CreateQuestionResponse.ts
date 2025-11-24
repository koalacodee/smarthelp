import type { QuestionDTO } from "./QuestionDTO";

export interface CreateQuestionResponse {
  question: QuestionDTO;
  uploadKey?: string;
  fileHubUploadKey?: string;
}
