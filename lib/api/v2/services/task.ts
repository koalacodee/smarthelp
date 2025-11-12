import type { AxiosInstance } from "axios";
import type {
  UUID,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  GetTaskResponse,
  GetAllTasksRequest,
  GetAllTasksResponse,
  DeleteTaskResponse,
  CountTasksResponse,
  SubmitTaskSubmissionRequest,
  SubmitTaskSubmissionResponse,
  ApproveTaskSubmissionRequest,
  ApproveTaskSubmissionResponse,
  RejectTaskSubmissionRequest,
  RejectTaskSubmissionResponse,
  GetTaskSubmissionResponse,
  GetMyTasksRequest,
  GetMyTasksResponse,
  GetTasksWithFiltersRequest,
  GetTasksWithFiltersResponse,
  GetTeamTasksRequest,
  GetTeamTasksResponse,
  GetIndividualLevelTasksRequest,
  GetIndividualLevelTasksResponse,
  GetSubDepartmentTasksRequest,
  GetSubDepartmentTasksResponse,
  GetDepartmentLevelTasksRequest,
  GetDepartmentLevelTasksResponse,
  MarkTaskSeenRequest,
  MarkTaskSeenResponse,
  ApproveTaskRequest,
  ApproveTaskResponse,
  RejectTaskRequest,
  RejectTaskResponse,
  SubmitTaskForReviewRequest,
  SubmitTaskForReviewResponse,
  SaveTaskPresetRequest,
  SaveTaskPresetResponse,
  GetTaskPresetsRequest,
  GetTaskPresetsResponse,
  CreateTaskFromPresetRequest,
  CreateTaskFromPresetResponse,
} from "../models/task";
import type { JSend } from "../models/jsend";
import { ExportTicketsResponse } from "../..";

/* =========================
   Request/Response Contracts
   ========================= */

/* =========================
   Service Singleton
   ========================= */

export class TaskService {
  private static instances = new WeakMap<AxiosInstance, TaskService>();

  private constructor(private readonly http: AxiosInstance) { }

  static getInstance(http: AxiosInstance): TaskService {
    let inst = TaskService.instances.get(http);
    if (!inst) {
      inst = new TaskService(http);
      TaskService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /tasks
  async createTask(body: CreateTaskRequest): Promise<CreateTaskResponse> {
    const { data } = await this.http.post<JSend<CreateTaskResponse>>(
      "/tasks",
      body
    );
    return data.data;
  }

  // PUT /tasks/:id
  async updateTask(
    id: UUID,
    body: UpdateTaskRequest
  ): Promise<UpdateTaskResponse> {
    const { data } = await this.http.put<JSend<UpdateTaskResponse>>(
      `/tasks/${id}`,
      body
    );
    return data.data;
  }

  // GET /tasks/:id
  async getTask(id: UUID): Promise<GetTaskResponse> {
    const { data } = await this.http.get<JSend<GetTaskResponse>>(
      `/tasks/${id}`
    );
    return data.data;
  }

  // GET /tasks
  async getAllTasks(
    params: GetAllTasksRequest = {}
  ): Promise<GetAllTasksResponse> {
    const { data } = await this.http.get<JSend<GetAllTasksResponse>>("/tasks", {
      params,
    });
    return data.data;
  }

  // DELETE /tasks/:id
  async deleteTask(id: UUID): Promise<DeleteTaskResponse> {
    const { data } = await this.http.delete<JSend<DeleteTaskResponse>>(
      `/tasks/${id}`
    );
    return data.data ?? null;
  }

  // GET /tasks/count/all
  async countTasks(): Promise<CountTasksResponse> {
    const { data } = await this.http.get<JSend<CountTasksResponse>>(
      "/tasks/count/all"
    );
    return data.data;
  }

  // POST /tasks/:taskId/submit-review
  async submitTaskSubmission(
    taskId: UUID,
    body: SubmitTaskSubmissionRequest
  ): Promise<SubmitTaskSubmissionResponse> {
    const { data } = await this.http.post<JSend<SubmitTaskSubmissionResponse>>(
      `/tasks/${taskId}/submit-review`,
      body
    );
    return data.data;
  }

  // POST /tasks/:taskId/approve
  async approveTaskSubmission(
    taskId: UUID,
    body: ApproveTaskSubmissionRequest
  ): Promise<ApproveTaskSubmissionResponse> {
    const { data } = await this.http.post<JSend<ApproveTaskSubmissionResponse>>(
      `/tasks/${taskId}/approve`,
      body
    );
    return data.data;
  }

  // POST /tasks/:taskId/reject
  async rejectTaskSubmission(
    taskId: UUID,
    body: RejectTaskSubmissionRequest
  ): Promise<RejectTaskSubmissionResponse> {
    const { data } = await this.http.post<JSend<RejectTaskSubmissionResponse>>(
      `/tasks/${taskId}/reject`,
      body
    );
    return data.data;
  }

  // GET /tasks/submissions/:id
  async getTaskSubmission(id: UUID): Promise<GetTaskSubmissionResponse> {
    const { data } = await this.http.get<JSend<GetTaskSubmissionResponse>>(
      `/tasks/submissions/${id}`
    );
    return data.data;
  }

  // GET /tasks/my-tasks
  async getMyTasks(
    params: GetMyTasksRequest = {}
  ): Promise<GetMyTasksResponse> {
    const { data } = await this.http.get<JSend<GetMyTasksResponse>>(
      "/tasks/my-tasks",
      { params }
    );
    return data.data;
  }

  // GET /tasks/search/filters
  async getTasksWithFilters(
    params: GetTasksWithFiltersRequest
  ): Promise<GetTasksWithFiltersResponse> {
    const { data } = await this.http.get<JSend<GetTasksWithFiltersResponse>>(
      "/tasks/search/filters",
      { params }
    );
    return data.data;
  }

  // GET /tasks/team-tasks
  async getTeamTasks(
    params: GetTeamTasksRequest
  ): Promise<GetTeamTasksResponse> {
    const { data } = await this.http.get<JSend<GetTeamTasksResponse>>(
      "/tasks/team-tasks",
      { params }
    );
    return data.data;
  }

  // GET /tasks/individual-level
  async getIndividualLevelTasks(
    params: GetIndividualLevelTasksRequest
  ): Promise<GetIndividualLevelTasksResponse> {
    const { data } = await this.http.get<
      JSend<GetIndividualLevelTasksResponse>
    >("/tasks/individual-level", { params });
    return data.data;
  }

  // GET /tasks/sub-department-level
  async getSubDepartmentTasks(
    params: GetSubDepartmentTasksRequest
  ): Promise<GetSubDepartmentTasksResponse> {
    const { data } = await this.http.get<JSend<GetSubDepartmentTasksResponse>>(
      "/tasks/sub-department-level",
      { params }
    );
    return data.data;
  }

  // GET /tasks/admin/department-level
  async getDepartmentLevelTasks(
    params: GetDepartmentLevelTasksRequest
  ): Promise<GetDepartmentLevelTasksResponse> {
    const { data } = await this.http.get<
      JSend<GetDepartmentLevelTasksResponse>
    >("/tasks/admin/department-level", { params });
    return data.data;
  }

  // POST /tasks/:id/seen
  async markTaskSeen(
    id: UUID,
    body: MarkTaskSeenRequest
  ): Promise<MarkTaskSeenResponse> {
    const { data } = await this.http.post<JSend<MarkTaskSeenResponse>>(
      `/tasks/${id}/seen`,
      body
    );
    return data.data;
  }

  // POST /tasks/:taskId/approve
  async approveTask(
    taskId: UUID,
    body: ApproveTaskRequest
  ): Promise<ApproveTaskResponse> {
    const { data } = await this.http.post<JSend<ApproveTaskResponse>>(
      `/tasks/${taskId}/approve`,
      body
    );
    return data.data;
  }

  // POST /tasks/:taskId/reject
  async rejectTask(
    taskId: UUID,
    body: RejectTaskRequest
  ): Promise<RejectTaskResponse> {
    const { data } = await this.http.post<JSend<RejectTaskResponse>>(
      `/tasks/${taskId}/reject`,
      body
    );
    return data.data;
  }

  // POST /tasks/:taskId/submit-review
  async submitTaskForReview(
    taskId: UUID,
    body: SubmitTaskForReviewRequest
  ): Promise<SubmitTaskForReviewResponse> {
    const { data } = await this.http.post<JSend<SubmitTaskForReviewResponse>>(
      `/tasks/${taskId}/submit-review`,
      body
    );
    return data.data;
  }

  // POST /tasks/presets
  async saveTaskPreset(
    body: SaveTaskPresetRequest
  ): Promise<SaveTaskPresetResponse> {
    const { data } = await this.http.post<JSend<SaveTaskPresetResponse>>(
      "/tasks/presets",
      body
    );
    return data.data;
  }

  // GET /tasks/presets
  async getTaskPresets(
    params: GetTaskPresetsRequest = {}
  ): Promise<GetTaskPresetsResponse> {
    const { data } = await this.http.get<JSend<GetTaskPresetsResponse>>(
      "/tasks/presets",
      { params }
    );
    return data.data;
  }

  // POST /tasks/from-preset
  async createTaskFromPreset(
    body: CreateTaskFromPresetRequest
  ): Promise<CreateTaskFromPresetResponse> {
    const { data } = await this.http.post<JSend<CreateTaskFromPresetResponse>>(
      "/tasks/from-preset",
      body
    );
    return data.data;
  }

  async exportTickets(startDate?: string, endDate?: string) {
    return await this.http.post<{
      data: ExportTicketsResponse;
    }>("/tasks/export", { start: startDate ?? undefined, end: endDate ?? undefined }).then((res) => res.data.data);
  }
}

/* =========================
   Factory
   ========================= */

export function createTaskService(http: AxiosInstance): TaskService {
  return TaskService.getInstance(http);
}
