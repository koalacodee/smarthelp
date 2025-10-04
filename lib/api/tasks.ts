export interface Response {
  data: Data;
  status: string;
}

export interface Data {
  count: number;
  data: Datum[];
  success: boolean;
}

export interface Datum {
  assignee?: Assignee;
  assigner?: Assigner;
  assignmentType?: TaskAssignmentType;
  createdAt?: string;
  description?: string;
  id: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: TaskStatus;
  title?: string;
  updatedAt?: string;
  dueDate?: string;
  reminderInterval?: number;
}

export interface Assignee {
  id: string;
  permissions: string[];
  supervisorId: string;
  user: User;
  userId: string;
}

export interface User {
  username: string;
  employeeId?: string;
  jobTitle: string;
  email: string;
  id: string;
  name: string;
  role: string;
  profilePicture?: string;
}

export interface Assigner {
  approvedTasks: any[];
  assignedTasks: AssignedTask[];
  createdAt: string;
  departments: Department[];
  employeeRequests: any[];
  id: string;
  performedTasks: any[];
  permissions: string[];
  promotions: any[];
  questions: any[];
  supportTicketAnswersAuthored: any[];
  updatedAt: string;
  userId: string;
}

export interface AssignedTask {
  approverAdminId?: null;
  approverSupervisorId?: null;
  assigneeId?: string;
  assignerAdminId?: null;
  assignerNotes?: null;
  assignerSupervisorId?: string;
  assignmentType?: TaskAssignmentType;
  completedAt?: null;
  createdAt?: string;
  description?: string;
  feedback?: null;
  id?: string;
  performerAdminId?: null;
  performerEmployeeId?: null;
  performerSupervisorId?: null;
  status?: TaskStatus;
  targetDepartmentId?: null;
  targetSubDepartmentId?: null;
  title?: string;
  updatedAt?: string;
}

export interface Department {
  createdAt?: string;
  id?: string;
  name?: string;
  parentId?: null;
  updatedAt?: string;
}

// export interface TaskResponse {
//   data: TaskData;
//   status: string;
// }

export interface TaskData<T> {
  count: number;
  data: T[];
  metrics: {
    pendingCount: number;
    completedCount: number;
    completionPercentage: number;
  };
  success: boolean;
}

export interface Task {
  assignmentType?: TaskAssignmentType;
  createdAt?: string;
  description?: string;
  id: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: TaskStatus;
  targetDepartment?: TargetDepartment;
  targetSubDepartment?: TargetDepartment;
  title?: string;
  updatedAt?: string;
  dueDate?: string;
  assignee?: Assignee;
  notes?: string;
  reminderInterval?: number;
}

export interface TargetDepartment {
  id: string;
  knowledgeChunks: any[];
  name: string;
  questions: any[];
  subDepartments: any[];
}

export interface CreateTaskDto {
  assignmentType: TaskAssignmentType;
  description: string;
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  assigneeId?: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  reminderInterval?: number;
}

export enum TaskAssignmentType {
  INDIVIDUAL = "INDIVIDUAL",
  DEPARTMENT = "DEPARTMENT",
  SUB_DEPARTMENT = "SUB_DEPARTMENT",
}

export enum TaskStatus {
  TODO = "TODO",
  SEEN = "SEEN",
  PENDING_REVIEW = "PENDING_REVIEW",
  COMPLETED = "COMPLETED",
}
