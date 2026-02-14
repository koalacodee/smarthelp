import { AxiosInstance } from "axios";
import type {
  // Core Task Management
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  DeleteTaskResponse,
  CountTasksResponse,
  RestartTaskResponse,
  ExportTasksRequest,
  ExportTasksResponse,
  // Task Querying & Filtering
  GetMyTasksParams,
  GetMyTasksResponse,
  GetTeamTasksParams,
  GetTeamTasksResponse,
  GetTeamTasksForSupervisorParams,
  GetTeamTasksForSupervisorResponse,
  GetDepartmentLevelTasksParams,
  GetDepartmentLevelTasksResponse,
  GetSubDepartmentTasksParams,
  GetSubDepartmentTasksResponse,
  GetIndividualLevelTasksParams,
  GetIndividualLevelTasksResponse,
  GetTasksWithFiltersParams,
  GetTasksWithFiltersResponse,
  GetAllTasksParams,
  GetAllTasksResponse,
  GetTaskResponse,
  // Task Submission & Review
  SubmitTaskForReviewRequest,
  SubmitTaskForReviewResponse,
  SubmitTaskSubmissionRequest,
  SubmitTaskSubmissionResponse,
  GetTaskSubmissionResponse,
  GetTaskSubmissionsByTaskResponse,
  ApproveTaskRequest,
  ApproveTaskSubmissionRequest,
  ApproveTaskSubmissionResponse,
  RejectTaskRequest,
  RejectTaskResponse,
  RejectTaskSubmissionRequest,
  RejectTaskSubmissionResponse,
  MarkTaskSeenResponse,
  // Task Delegation
  DelegateTaskRequest,
  DelegationResponse,
  GetDelegablesParams,
  DelegableResponse,
  GetMyDelegationsParams,
  GetMyDelegationsResponse,
  GetDelegationResponse,
  GetDelegationsForTaskParams,
  GetDelegationsForTaskResponse,
  GetDelegationsForSubDepartmentParams,
  GetDelegationsForSubDepartmentResponse,
  GetDelegationsForEmployeeParams,
  GetDelegationsForEmployeeResponse,
  UpdateDelegationRequest,
  ApproveTaskDelegationRequest,
  ApproveTaskDelegationResponse,
  RejectTaskDelegationSubmissionRequest,
  RejectTaskDelegationSubmissionResponse,
  ForwardTaskDelegationSubmissionResponse,
  MarkDelegationSeenResponse,
  // Task Presets
  SaveTaskPresetRequest,
  SaveTaskPresetResponse,
  GetTaskPresetsParams,
  GetTaskPresetsResponse,
  // Task Visibility
  TaskVisibilityResponse,
  TasksVisibilityResponse,
} from "./types";

export interface JSend<T> {
  status: "success" | "fail" | "error";
  data: T;
}

export class TasksAPI {
  private readonly BASE: string;
  constructor(private readonly axios: AxiosInstance) {
    this.BASE = `${this.axios.defaults.baseURL}/tasks`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CORE TASK MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════

  async createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
    const res = await this.axios.post<JSend<CreateTaskResponse>>(
      this.BASE,
      data,
    );
    return res.data.data;
  }

  async updateTask(
    id: string,
    data: UpdateTaskRequest,
  ): Promise<UpdateTaskResponse> {
    const res = await this.axios.put<JSend<UpdateTaskResponse>>(
      `${this.BASE}/${id}`,
      data,
    );
    return res.data.data;
  }

  async deleteTask(id: string): Promise<DeleteTaskResponse> {
    const res = await this.axios.delete<JSend<DeleteTaskResponse>>(
      `${this.BASE}/${id}`,
    );
    return res.data.data;
  }

  async countTasks(): Promise<CountTasksResponse> {
    const res = await this.axios.get<JSend<CountTasksResponse>>(
      `${this.BASE}/count`,
    );
    return res.data.data;
  }

  async restartTask(id: string): Promise<RestartTaskResponse> {
    const res = await this.axios.post<JSend<RestartTaskResponse>>(
      `${this.BASE}/${id}/restart`,
    );
    return res.data.data;
  }

  async exportTasks(data: ExportTasksRequest): Promise<ExportTasksResponse> {
    const res = await this.axios.post<JSend<ExportTasksResponse>>(
      `${this.BASE}/export`,
      data,
    );
    return res.data.data;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TASK QUERYING & FILTERING
  // ═══════════════════════════════════════════════════════════════════════

  async getMyTasks(params: GetMyTasksParams): Promise<GetMyTasksResponse> {
    const res = await this.axios.get<JSend<GetMyTasksResponse>>(
      `${this.BASE}/my-tasks`,
      {
        params,
      },
    );
    return res.data.data;
  }

  async getTeamTasks(
    params: GetTeamTasksParams,
  ): Promise<GetTeamTasksResponse> {
    const res = await this.axios.get<JSend<GetTeamTasksResponse>>(
      `${this.BASE}/team-tasks`,
      {
        params,
      },
    );
    return res.data.data;
  }

  async getTeamTasksForSupervisor(
    params: GetTeamTasksForSupervisorParams,
  ): Promise<GetTeamTasksForSupervisorResponse> {
    const res = await this.axios.get<JSend<GetTeamTasksForSupervisorResponse>>(
      `${this.BASE}/team-tasks/supervisor`,
      { params },
    );
    return res.data.data;
  }

  async getDepartmentLevelTasks(
    params: GetDepartmentLevelTasksParams,
  ): Promise<GetDepartmentLevelTasksResponse> {
    const res = await this.axios.get<JSend<GetDepartmentLevelTasksResponse>>(
      `${this.BASE}/department-level`,
      { params },
    );
    return res.data.data;
  }

  async getSubDepartmentTasks(
    params: GetSubDepartmentTasksParams,
  ): Promise<GetSubDepartmentTasksResponse> {
    const res = await this.axios.get<JSend<GetSubDepartmentTasksResponse>>(
      `${this.BASE}/sub-department-level`,
      { params },
    );
    return res.data.data;
  }

  async getIndividualLevelTasks(
    params: GetIndividualLevelTasksParams,
  ): Promise<GetIndividualLevelTasksResponse> {
    const res = await this.axios.get<JSend<GetIndividualLevelTasksResponse>>(
      `${this.BASE}/individual-level`,
      { params },
    );
    return res.data.data;
  }

  async getTasksWithFilters(
    params: GetTasksWithFiltersParams,
  ): Promise<GetTasksWithFiltersResponse> {
    const res = await this.axios.get<JSend<GetTasksWithFiltersResponse>>(
      `${this.BASE}/search/filters`,
      { params },
    );
    return res.data.data;
  }

  async getAllTasks(params: GetAllTasksParams): Promise<GetAllTasksResponse> {
    const res = await this.axios.get<JSend<GetAllTasksResponse>>(
      `${this.BASE}/all`,
      {
        params,
      },
    );
    return res.data.data;
  }

  async getTask(id: string): Promise<GetTaskResponse> {
    const res = await this.axios.get<JSend<GetTaskResponse>>(
      `${this.BASE}/${id}`,
    );
    return res.data.data;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TASK SUBMISSION & REVIEW
  // ═══════════════════════════════════════════════════════════════════════

  async submitTaskForReview(
    taskId: string,
    data: SubmitTaskForReviewRequest,
  ): Promise<SubmitTaskForReviewResponse> {
    const res = await this.axios.post<JSend<SubmitTaskForReviewResponse>>(
      `${this.BASE}/${taskId}/submit-review`,
      data,
    );
    return res.data.data;
  }

  async approveTask(taskId: string, data: ApproveTaskRequest): Promise<void> {
    await this.axios.post<JSend<void>>(`${this.BASE}/${taskId}/approve`, data);
  }

  async rejectTask(
    taskId: string,
    data: RejectTaskRequest,
  ): Promise<RejectTaskResponse> {
    const res = await this.axios.post<JSend<RejectTaskResponse>>(
      `${this.BASE}/${taskId}/reject`,
      data,
    );
    return res.data.data;
  }

  async markTaskSeen(taskId: string): Promise<MarkTaskSeenResponse> {
    const res = await this.axios.post<JSend<MarkTaskSeenResponse>>(
      `${this.BASE}/${taskId}/seen`,
    );
    return res.data.data;
  }

  async submitTaskSubmission(
    taskId: string,
    data: SubmitTaskSubmissionRequest,
  ): Promise<SubmitTaskSubmissionResponse> {
    const res = await this.axios.post<JSend<SubmitTaskSubmissionResponse>>(
      `${this.BASE}/submissions/${taskId}`,
      data,
    );
    return res.data.data;
  }

  async approveTaskSubmission(
    submissionId: string,
    data: ApproveTaskSubmissionRequest,
  ): Promise<ApproveTaskSubmissionResponse> {
    const res = await this.axios.post<JSend<ApproveTaskSubmissionResponse>>(
      `${this.BASE}/submissions/${submissionId}/approve`,
      data,
    );
    return res.data.data;
  }

  async rejectTaskSubmission(
    submissionId: string,
    data: RejectTaskSubmissionRequest,
  ): Promise<RejectTaskSubmissionResponse> {
    const res = await this.axios.post<JSend<RejectTaskSubmissionResponse>>(
      `${this.BASE}/submissions/${submissionId}/reject`,
      data,
    );
    return res.data.data;
  }

  async getTaskSubmission(
    submissionId: string,
  ): Promise<GetTaskSubmissionResponse> {
    const res = await this.axios.get<JSend<GetTaskSubmissionResponse>>(
      `${this.BASE}/submissions/${submissionId}`,
    );
    return res.data.data;
  }

  async getTaskSubmissionsByTask(
    taskId: string,
  ): Promise<GetTaskSubmissionsByTaskResponse> {
    const res = await this.axios.get<JSend<GetTaskSubmissionsByTaskResponse>>(
      `${this.BASE}/submissions/task/${taskId}`,
    );
    return res.data.data;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TASK DELEGATION
  // ═══════════════════════════════════════════════════════════════════════

  async delegateTask(data: DelegateTaskRequest): Promise<DelegationResponse> {
    const res = await this.axios.post<JSend<DelegationResponse>>(
      `${this.BASE}/delegations`,
      data,
    );
    return res.data.data;
  }

  async getDelegables(
    params: GetDelegablesParams,
  ): Promise<DelegableResponse[]> {
    const res = await this.axios.get<JSend<DelegableResponse[]>>(
      `${this.BASE}/delegations/delegables`,
      { params },
    );
    return res.data.data;
  }

  async getMyDelegations(
    params: GetMyDelegationsParams,
  ): Promise<GetMyDelegationsResponse> {
    const res = await this.axios.get<JSend<GetMyDelegationsResponse>>(
      `${this.BASE}/delegations/my`,
      { params },
    );
    return res.data.data;
  }

  async getDelegationsForEmployee(
    params: GetDelegationsForEmployeeParams,
  ): Promise<GetDelegationsForEmployeeResponse> {
    const res = await this.axios.get<JSend<GetDelegationsForEmployeeResponse>>(
      `${this.BASE}/delegations/employee`,
      { params },
    );
    return res.data.data;
  }

  async getDelegationsForTask(
    taskId: string,
    params: GetDelegationsForTaskParams,
  ): Promise<GetDelegationsForTaskResponse> {
    const res = await this.axios.get<JSend<GetDelegationsForTaskResponse>>(
      `${this.BASE}/delegations/task/${taskId}`,
      { params },
    );
    return res.data.data;
  }

  async getDelegationsForSubDepartment(
    subDepartmentId: string,
    params: GetDelegationsForSubDepartmentParams,
  ): Promise<GetDelegationsForSubDepartmentResponse> {
    const res = await this.axios.get<
      JSend<GetDelegationsForSubDepartmentResponse>
    >(`${this.BASE}/delegations/sub-department/${subDepartmentId}`, { params });
    return res.data.data;
  }

  async getDelegation(delegationId: string): Promise<GetDelegationResponse> {
    const res = await this.axios.get<JSend<GetDelegationResponse>>(
      `${this.BASE}/delegations/${delegationId}`,
    );
    return res.data.data;
  }

  async updateDelegation(
    delegationId: string,
    data: UpdateDelegationRequest,
  ): Promise<void> {
    await this.axios.put(`${this.BASE}/delegations/${delegationId}`, data);
  }

  async deleteDelegation(delegationId: string): Promise<void> {
    await this.axios.delete(`${this.BASE}/delegations/${delegationId}`);
  }

  async markDelegationSeen(
    delegationId: string,
  ): Promise<MarkDelegationSeenResponse> {
    const res = await this.axios.post<JSend<MarkDelegationSeenResponse>>(
      `${this.BASE}/delegations/${delegationId}/seen`,
    );
    return res.data.data;
  }

  async approveDelegationSubmission(
    submissionId: string,
    data: ApproveTaskDelegationRequest,
  ): Promise<ApproveTaskDelegationResponse> {
    const res = await this.axios.post<JSend<ApproveTaskDelegationResponse>>(
      `${this.BASE}/delegations/submissions/${submissionId}/approve`,
      data,
    );
    return res.data.data;
  }

  async rejectDelegationSubmission(
    submissionId: string,
    data: RejectTaskDelegationSubmissionRequest,
  ): Promise<RejectTaskDelegationSubmissionResponse> {
    const res = await this.axios.post<
      JSend<RejectTaskDelegationSubmissionResponse>
    >(`${this.BASE}/delegations/submissions/${submissionId}/reject`, data);
    return res.data.data;
  }

  async forwardDelegationSubmission(
    submissionId: string,
  ): Promise<ForwardTaskDelegationSubmissionResponse> {
    const res = await this.axios.post<
      JSend<ForwardTaskDelegationSubmissionResponse>
    >(`${this.BASE}/delegations/submissions/${submissionId}/forward`);
    return res.data.data;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TASK PRESETS
  // ═══════════════════════════════════════════════════════════════════════

  async saveTaskPreset(
    data: SaveTaskPresetRequest,
  ): Promise<SaveTaskPresetResponse> {
    const res = await this.axios.post<JSend<SaveTaskPresetResponse>>(
      `${this.BASE}/presets`,
      data,
    );
    return res.data.data;
  }

  async getTaskPresets(
    params: GetTaskPresetsParams,
  ): Promise<GetTaskPresetsResponse> {
    const res = await this.axios.get<JSend<GetTaskPresetsResponse>>(
      `${this.BASE}/presets`,
      {
        params,
      },
    );
    return res.data.data;
  }

  async deleteTaskPreset(presetId: string): Promise<void> {
    await this.axios.delete(`${this.BASE}/presets/${presetId}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TASK VISIBILITY
  // ═══════════════════════════════════════════════════════════════════════

  async getTasksVisibility(): Promise<TasksVisibilityResponse> {
    const res = await this.axios.get<JSend<TasksVisibilityResponse>>(
      `${this.BASE}/visibility`,
    );
    return res.data.data;
  }

  async getTaskVisibility(taskId: string): Promise<TaskVisibilityResponse> {
    const res = await this.axios.get<JSend<TaskVisibilityResponse>>(
      `${this.BASE}/${taskId}/visibility`,
    );
    return res.data.data;
  }
}
