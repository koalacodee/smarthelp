export interface QuestionDTO {
  text?: string;
  answer?: string | null;
  id?: string;
  satisfaction?: number;
  dissatisfaction?: number;
  views?: number;
  departmentId?: string;
}
