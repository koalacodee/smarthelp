import type { QuestionDTO } from "./QuestionDTO";

export interface UpdateQuestionResponse {
  question: QuestionDTO;
  uploadKey?: string;
}
