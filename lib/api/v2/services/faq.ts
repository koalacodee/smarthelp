import type { AxiosInstance } from "axios";
import type {
  UUID,
  ViewFaqsRequest,
  ViewFaqsResponse,
  GetSharedDepartmentFaqsRequest,
  GetSharedDepartmentFaqsResponse,
  RecordInteractionRequest,
  RecordInteractionResponse,
  GetGroupedByDepartmentResponse,
  CreateQuestionRequest,
  CreateQuestionResponse,
  UpdateQuestionRequest,
  UpdateQuestionResponse,
  GetQuestionResponse,
  GetAllQuestionsRequest,
  GetAllQuestionsResponse,
  DeleteQuestionResponse,
  DeleteManyQuestionsRequest,
  DeleteManyQuestionsResponse,
  CountQuestionsResponse,
} from "../models/faq";
import type { JSend } from "../models/jsend";

/* =========================
   Request/Response Contracts
   ========================= */

/* =========================
   Service Singleton
   ========================= */

export class FAQService {
  private static instances = new WeakMap<AxiosInstance, FAQService>();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): FAQService {
    let inst = FAQService.instances.get(http);
    if (!inst) {
      inst = new FAQService(http);
      FAQService.instances.set(http, inst);
    }
    return inst;
  }

  // GET /questions/view
  async viewFaqs(params: ViewFaqsRequest): Promise<ViewFaqsResponse> {
    const { data } = await this.http.get<JSend<ViewFaqsResponse>>(
      "/questions/view",
      {
        params,
      }
    );
    return data.data;
  }

  // GET /questions/shared
  async getSharedDepartmentFaqs(
    params: GetSharedDepartmentFaqsRequest
  ): Promise<GetSharedDepartmentFaqsResponse> {
    const { data } = await this.http.get<
      JSend<GetSharedDepartmentFaqsResponse>
    >("/questions/shared", { params });
    return data.data;
  }

  // POST /questions/:type/:faqId
  async recordInteraction(
    req: RecordInteractionRequest
  ): Promise<RecordInteractionResponse> {
    const { faqId, type } = req;
    const { data } = await this.http.post<JSend<RecordInteractionResponse>>(
      `/questions/${type}/${faqId}`
    );
    return data.data ?? null;
  }

  // GET /questions/grouped
  async getAllGroupedByDepartment(): Promise<GetGroupedByDepartmentResponse> {
    const { data } = await this.http.get<JSend<GetGroupedByDepartmentResponse>>(
      "/questions/grouped"
    );
    return data.data;
  }

  // POST /questions
  async createQuestion(
    body: CreateQuestionRequest
  ): Promise<CreateQuestionResponse> {
    const { data } = await this.http.post<JSend<CreateQuestionResponse>>(
      "/questions",
      body
    );
    return data.data;
  }

  // PUT /questions/:id
  async updateQuestion(
    id: UUID,
    body: UpdateQuestionRequest
  ): Promise<UpdateQuestionResponse> {
    const { data } = await this.http.put<JSend<UpdateQuestionResponse>>(
      `/questions/${id}`,
      body
    );
    return data.data;
  }

  // GET /questions/:id
  async getQuestion(id: UUID): Promise<GetQuestionResponse> {
    const { data } = await this.http.get<JSend<GetQuestionResponse>>(
      `/questions/${id}`
    );
    return data.data;
  }

  // GET /questions
  async getAllQuestions(
    params: GetAllQuestionsRequest = {}
  ): Promise<GetAllQuestionsResponse> {
    const { data } = await this.http.get<JSend<GetAllQuestionsResponse>>(
      "/questions",
      { params }
    );
    return data.data;
  }

  // DELETE /questions/:id
  async deleteQuestion(id: UUID): Promise<DeleteQuestionResponse> {
    const { data } = await this.http.delete<JSend<DeleteQuestionResponse>>(
      `/questions/${id}`
    );
    return data.data ?? null;
  }

  // DELETE /questions/multiple
  async deleteManyQuestions(
    body: DeleteManyQuestionsRequest
  ): Promise<DeleteManyQuestionsResponse> {
    const { data } = await this.http.delete<JSend<DeleteManyQuestionsResponse>>(
      "/questions/multiple",
      { data: body }
    );
    return data.data;
  }

  // GET /questions/count
  async countQuestions(): Promise<CountQuestionsResponse> {
    const { data } = await this.http.get<JSend<CountQuestionsResponse>>(
      "/questions/count"
    );
    return data.data;
  }
}

/* =========================
   Factory
   ========================= */

export function createFAQService(http: AxiosInstance): FAQService {
  return FAQService.getInstance(http);
}
