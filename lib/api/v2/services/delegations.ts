import type { AxiosInstance } from "axios";

import type { JSend } from "../models/jsend";
import { EmployeeResponse, UUID } from "./employee";
import { TaskDTO } from "../models/task";
import { Department } from "../../departments";
import { FileHubAttachment } from "./shared/filehub";

/* =========================
   Request/Response Contracts
   ========================= */

export interface DelegateTaskRequest {
  taskId: UUID;
  assigneeId?: UUID;
  targetSubDepartmentId?: UUID;
}

export interface DelegateTaskResponse {
  delegation: TaskDelegationDTO;
}

export interface TaskDelegationDTO {
  id: UUID;
  taskId: UUID;
  task?: TaskDTO; // TaskDTOhhgoyi8unnnbbn,nm,./poiuhdat98 6
  assignee?: EmployeeResponse; // EmployeeDTO
  assigneeId?: UUID;
  targetSubDepartment: Department; // DepartmentDTO
  targetSubDepartmentId: UUID;
  delegator: any; // SupervisorDTO
  delegatorId: UUID;
  status: "TODO" | "PENDING_REVIEW" | "COMPLETED";
  assignmentType: "INDIVIDUAL" | "SUB_DEPARTMENT";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SubmitTaskDelegationForReviewRequest {
  notes?: string;
  chooseAttachments?: string[];
}

export interface SubmitTaskDelegationForReviewResponse {
  delegation: TaskDelegationDTO;
  submission: TaskDelegationSubmissionDTO;
  uploadKey?: string;
}

export interface TaskDelegationSubmissionDTO {
  id: UUID;
  delegationId: UUID;
  delegation?: TaskDelegationDTO;
  taskId: UUID;
  task?: any; // TaskDTO
  performerId: UUID;
  performerType: "admin" | "supervisor" | "employee";
  performerName?: string;
  performer?: any; // AdminDTO | SupervisorDTO | EmployeeDTO
  notes?: string;
  feedback?: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: any; // AdminDTO | SupervisorDTO
  forwarded: boolean;
}

export interface ApproveTaskDelegationRequest {
  feedback?: string;
}

export interface ApproveTaskDelegationResponse {
  delegation: TaskDelegationDTO;
  submission: TaskDelegationSubmissionDTO;
}

export interface RejectTaskDelegationRequest {
  feedback?: string;
}

export interface RejectTaskDelegationResponse {
  delegation: TaskDelegationDTO;
  submission: TaskDelegationSubmissionDTO;
}

export interface ForwardTaskDelegationSubmissionRequest {
  // Empty body, delegatorUserId comes from auth
}

export interface ForwardTaskDelegationSubmissionResponse {
  submission: TaskDelegationSubmissionDTO;
}

export interface GetDelegablesResponse {
  employees: EmployeeResponse[]; // EmployeeDTO[]
  subDepartments: Department[]; // DepartmentDTO[]
}

interface GetMyDelegationsInputDto {
  offset?: number;
  limit?: number;
  status?: string;
}

interface GetMyDelegationsResult {
  delegations: TaskDelegationDTO[];
  submissions: { [delegationId: string]: TaskDelegationSubmissionDTO[] };
  attachments: { [delegationId: string]: string[] };
  delegationSubmissionAttachments: { [submissionId: string]: string[] };
  fileHubAttachments: FileHubAttachment[];
  total: number;
}

/* =========================
   Service Singleton
   ========================= */

export class TaskDelegationService {
  private static instances = new WeakMap<
    AxiosInstance,
    TaskDelegationService
  >();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): TaskDelegationService {
    let inst = TaskDelegationService.instances.get(http);
    if (!inst) {
      inst = new TaskDelegationService(http);
      TaskDelegationService.instances.set(http, inst);
    }
    return inst;
  }

  async getMyDelegations(
    params: GetMyDelegationsInputDto
  ): Promise<GetMyDelegationsResult> {
    const { data } = await this.http.get<JSend<GetMyDelegationsResult>>(
      "/task-delegations/my-delegations",
      { params }
    );
    return data.data;
  }

  /**
   * POST /task-delegations
   * Delegate a task to an employee or sub-department
   */
  async delegateTask(body: DelegateTaskRequest): Promise<DelegateTaskResponse> {
    const { data } = await this.http.post<JSend<DelegateTaskResponse>>(
      "/task-delegations",
      body
    );
    return data.data;
  }

  /**
   * POST /task-delegations/:delegationId/submit
   * Submit a task delegation for review
   */
  async submitForReview(
    delegationId: UUID,
    body: SubmitTaskDelegationForReviewRequest = {},
    attach: boolean = false
  ) {
    const { data } = await this.http.post<
      JSend<SubmitTaskDelegationForReviewResponse>
    >(`/task-delegations/${delegationId}/submit`, {
      ...body,
      attach,
    });

    return data.data;
  }

  /**
   * POST /task-delegations/submissions/:submissionId/approve
   * Approve a task delegation submission
   */
  async approveSubmission(
    submissionId: UUID,
    body: ApproveTaskDelegationRequest = {}
  ): Promise<ApproveTaskDelegationResponse> {
    const { data } = await this.http.post<JSend<ApproveTaskDelegationResponse>>(
      `/task-delegations/submissions/${submissionId}/approve`,
      body
    );
    return data.data;
  }

  /**
   * POST /task-delegations/submissions/:submissionId/reject
   * Reject a task delegation submission
   */
  async rejectSubmission(
    submissionId: UUID,
    body: RejectTaskDelegationRequest = {}
  ): Promise<RejectTaskDelegationResponse> {
    const { data } = await this.http.post<JSend<RejectTaskDelegationResponse>>(
      `/task-delegations/submissions/${submissionId}/reject`,
      body
    );
    return data.data;
  }

  /**
   * POST /task-delegations/submissions/:submissionId/forward
   * Forward a task delegation submission (only by original delegator)
   */
  async forwardSubmission(
    submissionId: UUID,
    body: ForwardTaskDelegationSubmissionRequest = {}
  ): Promise<ForwardTaskDelegationSubmissionResponse> {
    const { data } = await this.http.post<
      JSend<ForwardTaskDelegationSubmissionResponse>
    >(`/task-delegations/submissions/${submissionId}/forward`, body);
    return data.data;
  }

  /**
   * GET /task-delegations/delegables
   * Get employees and sub-departments that the current supervisor can delegate tasks to
   */
  async getDelegables(q?: string): Promise<GetDelegablesResponse> {
    const { data } = await this.http.get<JSend<GetDelegablesResponse>>(
      "/task-delegations/delegables",
      { params: { q } }
    );
    return data.data;
  }
}

/* =========================
   Factory
   ========================= */

export function createTaskDelegationService(
  http: AxiosInstance
): TaskDelegationService {
  return TaskDelegationService.getInstance(http);
}
