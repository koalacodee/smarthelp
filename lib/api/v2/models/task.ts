// models/task.ts

export type UUID = string;

export interface AttachmentMap {
  [taskId: string]: string[];
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  assigner: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "SUPERVISOR";
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  status: "TODO" | "SEEN" | "PENDING_REVIEW" | "COMPLETED";
  assignmentType: "INDIVIDUAL" | "DEPARTMENT" | "SUB_DEPARTMENT";
  priority: "LOW" | "MEDIUM" | "HIGH";
  targetDepartment?: {
    id: string;
    name: string;
  };
  targetSubDepartment?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  reminderInterval?: number;
  attachments?: string[];
}

export interface TaskPresetDTO {
  id: string;
  name: string;
  title: string;
  description: string;
  dueDate?: string;
  assigneeId?: string;
  assignerId: string;
  assignerRole: "ADMIN" | "SUPERVISOR";
  approverId?: string;
  assignmentType: "INDIVIDUAL" | "DEPARTMENT" | "SUB_DEPARTMENT";
  priority: "LOW" | "MEDIUM" | "HIGH";
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  reminderInterval?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubmissionDTO {
  id: string;
  taskId: string;
  performerId: string;
  performerType: "admin" | "supervisor" | "employee";
  notes?: string;
  feedback?: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

/* =========================
   Request/Response Contracts
   ========================= */

// Create Task
export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate?: string;
  assigneeId?: string;
  status?: "TODO" | "SEEN" | "PENDING_REVIEW" | "COMPLETED";
  assignmentType: "INDIVIDUAL" | "DEPARTMENT" | "SUB_DEPARTMENT";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  completedAt?: string;
  attach?: boolean;
  reminderInterval?: number;
  savePreset?: boolean;
}

export interface CreateTaskResponse {
  task: TaskDTO;
  uploadKey?: string;
}

// Update Task
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  assigneeId?: string;
  status?: "TODO" | "SEEN" | "PENDING_REVIEW" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  completedAt?: string;
  attach?: boolean;
  reminderInterval?: number;
}

export interface UpdateTaskResponse {
  task: TaskDTO;
  uploadKey?: string;
}

// Get Task
export interface GetTaskResponse {
  task: TaskDTO;
  attachments: AttachmentMap;
}

// Get All Tasks
export interface GetAllTasksRequest {
  offset?: number;
  limit?: number;
}

export interface GetAllTasksResponse {
  tasks: TaskDTO[];
  attachments: AttachmentMap;
}

// Delete Task
export interface DeleteTaskResponse {
  task: TaskDTO | null;
}

// Count Tasks
export interface CountTasksResponse {
  count: number;
}

// Submit Task Submission
export interface SubmitTaskSubmissionRequest {
  notes?: string;
  attach?: boolean;
}

export interface SubmitTaskSubmissionResponse {
  task: TaskDTO;
  uploadKey?: string;
  attachments: AttachmentMap;
}

// Approve Task Submission
export interface ApproveTaskSubmissionRequest {
  feedback?: string;
}

export interface ApproveTaskSubmissionResponse {
  task: TaskDTO;
}

// Reject Task Submission
export interface RejectTaskSubmissionRequest {
  feedback: string;
}

export interface RejectTaskSubmissionResponse {
  task: TaskDTO;
}

// Get Task Submission
export interface GetTaskSubmissionResponse {
  submission: TaskSubmissionDTO;
}

// Get My Tasks
export interface GetMyTasksRequest {
  offset?: number;
  limit?: number;
  status?: string;
}

export interface GetMyTasksResponse {
  success: boolean;
  data: Array<TaskDTO & { canSubmitWork: boolean }>;
  total: number;
  metrics: {
    todo: number;
    seen: number;
    pendingReview: number;
    completed: number;
  };
  attachments: AttachmentMap;
}

// Get Tasks With Filters
export interface GetTasksWithFiltersRequest {
  status?: string;
  priority?: string;
  assignmentType?: string;
  assigneeId?: string;
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  startDate?: string;
  endDate?: string;
  offset?: number;
  limit?: number;
}

export interface GetTasksWithFiltersResponse {
  tasks: TaskDTO[];
  attachments: AttachmentMap;
}

// Get Team Tasks
export interface GetTeamTasksRequest {
  departmentId?: string;
  subDepartmentId?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface GetTeamTasksResponse {
  tasks: TaskDTO[];
  attachments: AttachmentMap;
}

// Get Individual Level Tasks
export interface GetIndividualLevelTasksRequest {
  assigneeId?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface GetIndividualLevelTasksResponse {
  tasks: TaskDTO[];
  attachments: AttachmentMap;
}

// Get Sub Department Tasks
export interface GetSubDepartmentTasksRequest {
  subDepartmentId?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface GetSubDepartmentTasksResponse {
  tasks: TaskDTO[];
  attachments: AttachmentMap;
}

// Get Department Level Tasks
export interface GetDepartmentLevelTasksRequest {
  departmentId?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface GetDepartmentLevelTasksResponse {
  success: boolean;
  data: TaskDTO[];
  metrics: {
    todo: number;
    seen: number;
    pendingReview: number;
    completed: number;
  };
  attachments: AttachmentMap;
}

// Mark Task Seen
export interface MarkTaskSeenRequest {
  seenAt?: string;
}

export interface MarkTaskSeenResponse {
  task: TaskDTO;
}

// Approve Task
export interface ApproveTaskRequest {
  feedback?: string;
}

export interface ApproveTaskResponse {
  task: TaskDTO;
}

// Reject Task
export interface RejectTaskRequest {
  feedback: string;
}

export interface RejectTaskResponse {
  task: TaskDTO;
}

// Submit Task For Review
export interface SubmitTaskForReviewRequest {
  notes?: string;
  attach?: boolean;
}

export interface SubmitTaskForReviewResponse {
  task: TaskDTO;
  uploadKey?: string;
}

// Save Task Preset
export interface SaveTaskPresetRequest {
  taskId: string;
  presetName: string;
}

export interface SaveTaskPresetResponse {
  preset: TaskPresetDTO;
}

// Get Task Presets
export interface GetTaskPresetsRequest {
  offset?: number;
  limit?: number;
}

export interface GetTaskPresetsResponse {
  presets: TaskPresetDTO[];
  total: number;
}

// Create Task From Preset
export interface CreateTaskFromPresetRequest {
  presetId: string;
  title?: string;
  description?: string;
  dueDate?: string;
  assigneeId?: string;
  approverId?: string;
  assignmentType?: "INDIVIDUAL" | "DEPARTMENT" | "SUB_DEPARTMENT";
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  attach?: boolean;
  reminderInterval?: number;
}

export interface CreateTaskFromPresetResponse {
  task: TaskDTO;
}
