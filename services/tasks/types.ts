// ═══════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════

export enum TaskStatus {
  TODO = "TODO",
  SEEN = "SEEN",
  PENDING_REVIEW = "PENDING_REVIEW",
  COMPLETED = "COMPLETED",
}

export enum TaskAssignmentType {
  INDIVIDUAL = "INDIVIDUAL",
  DEPARTMENT = "DEPARTMENT",
  SUB_DEPARTMENT = "SUB_DEPARTMENT",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// ═══════════════════════════════════════════════════════════════════════
// SHARED / BASE TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CursorDto {
  cursor?: string;
  direction?: "next" | "prev";
  pageSize?: number;
}

export interface CursorMeta {
  nextCursor?: string;
  prevCursor?: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TaskReminderResponse {
  id: string;
  name: string;
  reminderDate: Date;
  reminderInterval: number;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  creatorId: string;
  assigneeId?: string;
  assignerId?: string;
  approverId?: string;
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  status: string;
  assignmentType: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  reminders?: TaskReminderResponse[];
  assigneeName?: string;
}

export interface AttachmentResponse {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  isGlobal?: boolean;
  expirationDate?: Date;
  targetId?: string;
  userId?: string;
  size: number;
  signedUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskSubmissionResponse {
  id: string;
  taskId?: string;
  delegationSubmissionId?: string;
  performerId: string;
  performerType: string;
  performerName?: string;
  notes?: string;
  feedback?: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedByAdminId?: string;
  reviewedBySupervisorId?: string;
}

export interface TaskDelegationSubmissionResponse {
  id: string;
  delegationId: string;
  taskId: string;
  performerId: string;
  performerType: string;
  performerName?: string;
  notes?: string;
  feedback?: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedByAdminId?: string;
  reviewedBySupervisorId?: string;
  forwarded: boolean;
}

export interface DelegationTaskSummary {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: Date;
}

export interface DelegationAssignee {
  name?: string;
}

export interface DelegationTargetSubDepartment {
  name?: string;
}

export interface DelegationResponse {
  id: string;
  taskId: string;
  delegatorId: string;
  assigneeId?: string;
  targetSubDepartmentId?: string;
  status: string;
  assignmentType: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  task?: DelegationTaskSummary;
  assignee?: DelegationAssignee;
  targetSubDepartment?: DelegationTargetSubDepartment;
}

export interface TaskMetricsResponse {
  pendingCount: number;
  completedCount: number;
  completionPercentage: number;
}

export interface MyTasksMetricsResponse {
  pendingTasks: number;
  completedTasks: number;
  taskCompletionPercentage: number;
}

// ═══════════════════════════════════════════════════════════════════════
// CORE TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

// ── Create Task ─────────────────────────────────────────────────────

export interface CreateTaskReminderRequest {
  name: string;
  reminderDate: Date;
  reminderInterval: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate?: Date;
  assigneeId?: string;
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  approverId?: string;
  completedAt?: Date;
  priority?: TaskPriority;
  attach?: boolean;
  reminders?: CreateTaskReminderRequest[];
  savePreset?: boolean;
  chooseAttachments?: string[];
}

export interface CreateTaskResponse {
  task: TaskResponse;
  fileHubUploadKey?: string;
}

// ── Update Task ─────────────────────────────────────────────────────

export interface UpdateTaskReminderRequest {
  name: string;
  reminderDate: Date;
  reminderInterval: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: Date;
  assigneeId?: string;
  assignerId?: string;
  approverId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  completedAt?: Date | null;
  attach?: boolean;
  deleteAttachments?: string[];
  chooseAttachments?: string[];
  deleteReminders?: string[];
  addReminders?: UpdateTaskReminderRequest[];
}

export interface UpdateTaskResponse {
  task: TaskResponse;
  fileHubUploadKey?: string;
}

// ── Delete Task ─────────────────────────────────────────────────────

export type DeleteTaskResponse = TaskResponse;

// ── Count Tasks ─────────────────────────────────────────────────────

export interface CountTasksResponse {
  count: number;
}

// ── Restart Task ────────────────────────────────────────────────────

export type RestartTaskResponse = TaskResponse;

// ── Export Tasks ────────────────────────────────────────────────────

export interface ExportTasksRequest {
  batchSize?: number;
  start?: Date;
  end?: Date;
}

export interface ExportTasksResponse {
  id: string;
  type: string;
  objectPath: string;
  size: number;
  rows: number;
  createdAt: string;
  updatedAt: string;
  shareKey: string;
}

// ═══════════════════════════════════════════════════════════════════════
// TASK QUERYING & FILTERING
// ═══════════════════════════════════════════════════════════════════════

// ── Get My Tasks ────────────────────────────────────────────────────

export interface GetMyTasksParams extends CursorDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  departmentId?: string;
  subDepartmentId?: string;
}

export interface MyTaskItemResponse {
  task: TaskResponse;
  rejectionReason?: string;
  approvalFeedback?: string;
}

export interface GetMyTasksResponse {
  data: MyTaskItemResponse[];
  meta: CursorMeta;
  delegations?: DelegationResponse[];
  fileHubAttachments: AttachmentResponse[];
  metrics: MyTasksMetricsResponse;
}

// ── Get Team Tasks ──────────────────────────────────────────────────

export interface GetTeamTasksParams extends CursorDto {
  employeeId?: string;
  subDepartmentId?: string;
  departmentId?: string;
  status?: TaskStatus;
}

export interface GetTeamTasksDataResponse {
  tasks: TaskResponse[];
  submissions: TaskSubmissionResponse[];
  delegationSubmissions: TaskDelegationSubmissionResponse[];
  attachments: AttachmentResponse[];
}

export interface GetTeamTasksResponse {
  meta: CursorMeta;
  data: GetTeamTasksDataResponse;
}

// ── Get Team Tasks For Supervisor ───────────────────────────────────

export interface GetTeamTasksForSupervisorParams extends CursorDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  departmentId?: string;
  subDepartmentId?: string;
}

export interface SupervisorTeamTaskItemResponse {
  task: TaskResponse;
  submissions: TaskSubmissionResponse[];
  delegationSubmissions: TaskDelegationSubmissionResponse[];
  rejectionReason?: string;
  approvalFeedback?: string;
}

export interface GetTeamTasksForSupervisorDataResponse {
  tasks: SupervisorTeamTaskItemResponse[];
  attachments: AttachmentResponse[];
  metrics: MyTasksMetricsResponse;
}

export interface GetTeamTasksForSupervisorResponse {
  meta: CursorMeta;
  data: GetTeamTasksForSupervisorDataResponse;
}

// ── Get Department Level Tasks ──────────────────────────────────────

export interface GetDepartmentLevelTasksParams extends CursorDto {
  departmentId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface GetDepartmentLevelTasksDataResponse {
  tasks: TaskResponse[];
  submissions: TaskSubmissionResponse[];
  attachments: AttachmentResponse[];
  metrics: TaskMetricsResponse;
}

export interface GetDepartmentLevelTasksResponse {
  meta: CursorMeta;
  data: GetDepartmentLevelTasksDataResponse;
}

// ── Get Sub-Department Tasks ────────────────────────────────────────

export interface GetSubDepartmentTasksParams extends CursorDto {
  subDepartmentId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface GetSubDepartmentTasksDataResponse {
  tasks: TaskResponse[];
  submissions: TaskSubmissionResponse[];
  attachments: AttachmentResponse[];
  metrics: TaskMetricsResponse;
}

export interface GetSubDepartmentTasksResponse {
  meta: CursorMeta;
  data: GetSubDepartmentTasksDataResponse;
}

// ── Get Individual Level Tasks ──────────────────────────────────────

export interface GetIndividualLevelTasksParams extends CursorDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  assigneeId?: string;
}

export interface GetIndividualLevelTasksDataResponse {
  tasks: TaskResponse[];
  submissions: TaskSubmissionResponse[];
  attachments: AttachmentResponse[];
  metrics: TaskMetricsResponse;
}

export interface GetIndividualLevelTasksResponse {
  meta: CursorMeta;
  data: GetIndividualLevelTasksDataResponse;
}

// ── Get Tasks With Filters ──────────────────────────────────────────

export interface GetTasksWithFiltersParams extends CursorDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  start?: Date;
  end?: Date;
  assigneeId?: string;
  departmentId?: string;
}

export interface GetTasksWithFiltersDataResponse {
  tasks: TaskResponse[];
  attachments: AttachmentResponse[];
}

export interface GetTasksWithFiltersResponse {
  meta: CursorMeta;
  data: GetTasksWithFiltersDataResponse;
}

// ── Get All Tasks ───────────────────────────────────────────────────

export interface GetAllTasksParams extends CursorDto {
  start?: Date;
  end?: Date;
}

export interface GetAllTasksDataResponse {
  tasks: TaskResponse[];
  attachments: AttachmentResponse[];
  submissions: TaskSubmissionResponse[];
}

export interface GetAllTasksResponse {
  meta: CursorMeta;
  data: GetAllTasksDataResponse;
}

// ── Get Single Task ─────────────────────────────────────────────────

export interface GetTaskResponse {
  task: TaskResponse;
  submissions: TaskSubmissionResponse[];
  delegationSubmissions: TaskDelegationSubmissionResponse[];
  attachments: AttachmentResponse[];
}

// ═══════════════════════════════════════════════════════════════════════
// TASK SUBMISSION & REVIEW
// ═══════════════════════════════════════════════════════════════════════

// ── Submit Task For Review ──────────────────────────────────────────

export interface SubmitTaskForReviewRequest {
  notes?: string;
  attach?: boolean;
  chooseAttachments?: string[];
}

export interface SubmitTaskForReviewResponse {
  submission: TaskSubmissionResponse;
  fileHubUploadKey?: string;
}

// ── Submit Task Submission ──────────────────────────────────────────

export interface SubmitTaskSubmissionRequest {
  notes?: string;
  attach?: boolean;
  chooseAttachments?: string[];
}

export interface SubmitTaskSubmissionResponse {
  taskSubmission: TaskSubmissionResponse;
  fileHubUploadKey?: string;
}

// ── Get Task Submission ─────────────────────────────────────────────

export interface GetTaskSubmissionResponse {
  submission: TaskSubmissionResponse;
  attachments: AttachmentResponse[];
}

export interface GetTaskSubmissionsByTaskResponse {
  taskSubmissions: TaskSubmissionResponse[];
  delegationSubmissions: TaskDelegationSubmissionResponse[];
  attachments: AttachmentResponse[];
}

// ── Approve Task ────────────────────────────────────────────────────

export interface ApproveTaskRequest {
  feedback?: string;
}

// ── Approve Task Submission ─────────────────────────────────────────

export interface ApproveTaskSubmissionRequest {
  feedback?: string;
}

export interface ApproveTaskSubmissionResponse {
  id: string;
  taskId?: string;
  delegationSubmissionId?: string;
  performerId: string;
  performerType: string;
  performerName?: string;
  notes?: string;
  feedback?: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedByAdminId?: string;
  reviewedBySupervisorId?: string;
}

// ── Reject Task ─────────────────────────────────────────────────────

export interface RejectTaskRequest {
  reason?: string;
}

export type RejectTaskResponse = TaskResponse;

// ── Reject Task Submission ──────────────────────────────────────────

export interface RejectTaskSubmissionRequest {
  reason?: string;
}

export interface RejectTaskSubmissionResponse {
  id: string;
  taskId?: string;
  delegationSubmissionId?: string;
  performerId: string;
  performerType: string;
  performerName?: string;
  notes?: string;
  feedback?: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedByAdminId?: string;
  reviewedBySupervisorId?: string;
}

// ── Mark Task Seen ──────────────────────────────────────────────────

export interface MarkTaskSeenResponse {
  task: TaskResponse;
}

// ═══════════════════════════════════════════════════════════════════════
// TASK DELEGATION
// ═══════════════════════════════════════════════════════════════════════

// ── Delegate Task ───────────────────────────────────────────────────

export interface DelegateTaskRequest {
  taskId: string;
  assigneeId?: string;
  targetSubDepartmentId?: string;
}

// ── Get Delegables ──────────────────────────────────────────────────

export interface GetDelegablesParams {
  search?: string;
}

export interface DelegableResponse {
  type: string;
  name: string;
  itemId: string;
  email: string;
  username: string;
  jobTitle: string;
}

// ── Get My Delegations ──────────────────────────────────────────────

export interface GetMyDelegationsParams extends CursorDto {
  status?: TaskStatus;
}

export interface GetMyDelegationsDataResponse {
  delegations: DelegationResponse[];
  submissions: TaskDelegationSubmissionResponse[];
  attachments: AttachmentResponse[];
}

export interface GetMyDelegationsResponse {
  meta: CursorMeta;
  data: GetMyDelegationsDataResponse;
}

// ── Get Delegation ──────────────────────────────────────────────────

export interface GetDelegationResponse {
  delegation: DelegationResponse;
  attachments: AttachmentResponse[];
}

// ── Get Delegations For Task ────────────────────────────────────────

export interface GetDelegationsForTaskParams extends CursorDto {
  status?: TaskStatus;
}

export interface GetDelegationsForTaskDataResponse {
  delegations: DelegationResponse[];
  attachments: AttachmentResponse[];
}

export interface GetDelegationsForTaskResponse {
  meta: CursorMeta;
  data: GetDelegationsForTaskDataResponse;
}

// ── Get Delegations For Sub-Department ──────────────────────────────

export interface GetDelegationsForSubDepartmentParams extends CursorDto {
  status?: TaskStatus;
}

export interface GetDelegationsForSubDepartmentDataResponse {
  delegations: DelegationResponse[];
  attachments: AttachmentResponse[];
}

export interface GetDelegationsForSubDepartmentResponse {
  meta: CursorMeta;
  data: GetDelegationsForSubDepartmentDataResponse;
}

// ── Get Delegations For Employee ────────────────────────────────────

export interface GetDelegationsForEmployeeParams extends CursorDto {
  status?: TaskStatus;
}

export interface GetDelegationsForEmployeeDataResponse {
  delegations: DelegationResponse[];
  attachments: AttachmentResponse[];
}

export interface GetDelegationsForEmployeeResponse {
  meta: CursorMeta;
  data: GetDelegationsForEmployeeDataResponse;
}

// ── Update Delegation ───────────────────────────────────────────────

export interface UpdateDelegationRequest {
  status?: string;
}

// ── Approve Task Delegation ─────────────────────────────────────────

export interface ApproveTaskDelegationRequest {
  feedback?: string;
}

export interface ApproveTaskDelegationResponse {
  delegation: DelegationResponse;
  submission: TaskDelegationSubmissionResponse;
}

// ── Reject Task Delegation Submission ───────────────────────────────

export interface RejectTaskDelegationSubmissionRequest {
  feedback?: string;
}

export interface RejectTaskDelegationSubmissionResponse {
  delegation: DelegationResponse;
  submission: TaskDelegationSubmissionResponse;
}

// ── Forward Task Delegation Submission ──────────────────────────────

export interface ForwardTaskDelegationSubmissionRequest {
  message?: string;
  targetSupervisorId?: string;
}

export interface ForwardTaskDelegationSubmissionResponse {
  id: string;
  delegationId: string;
  taskId: string;
  performerId: string;
  performerType: string;
  performerName?: string;
  notes?: string;
  feedback?: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedByAdminId?: string;
  reviewedBySupervisorId?: string;
  forwarded: boolean;
  forwardedMessage?: string;
  forwardedToSupervisorId?: string;
}

// ── Mark Delegation Seen ────────────────────────────────────────────

export interface MarkDelegationSeenResponse {
  delegation: DelegationResponse;
}

// ═══════════════════════════════════════════════════════════════════════
// TASK PRESETS
// ═══════════════════════════════════════════════════════════════════════

export interface TaskPresetResponse {
  id: string;
  name: string;
  title: string;
  description: string;
  dueDate?: Date;
  assigneeId?: string;
  assignerId: string;
  assignerRole: string;
  approverId?: string;
  assignmentType: string;
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  priority: string;
  reminderInterval?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveTaskPresetRequest {
  taskId: string;
  presetName: string;
}

export interface SaveTaskPresetResponse {
  preset: TaskPresetResponse;
}

export interface GetTaskPresetsParams extends CursorDto {}

export interface GetTaskPresetsResponse {
  presets: TaskPresetResponse[];
  total: number;
}

// ═══════════════════════════════════════════════════════════════════════
// TASK VISIBILITY
// ═══════════════════════════════════════════════════════════════════════

export interface TaskVisibilityResponse {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface TasksVisibilityResponse {
  visibleDepartmentIds: string[];
  visibleSubDepartmentIds: string[];
}
