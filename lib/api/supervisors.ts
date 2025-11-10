import { User } from "./tasks";

export interface CreateSupervisorDto {
  name: string;
  email: string;
  employeeId?: string;
  jobTitle: string;
  departmentIds: string[];
  permissions: SupervisorPermissions[];
}

export interface UpdateSupervisorDto extends Partial<CreateSupervisorDto> { }

export enum SupervisorPermissions {
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  MANAGE_SUB_DEPARTMENTS = "MANAGE_SUB_DEPARTMENTS",
  MANAGE_PROMOTIONS = "MANAGE_PROMOTIONS",
  VIEW_USER_ACTIVITY = "VIEW_USER_ACTIVITY",
  MANAGE_STAFF_DIRECTLY = "MANAGE_STAFF_DIRECTLY",
  MANAGE_TASKS = "MANAGE_TASKS",
  MANAGE_ATTACHMENT_GROUPS = "MANAGE_ATTACHMENT_GROUPS"
}

export interface SupervisorsResponse {
  data: Datum[];
  status: string;
  [property: string]: any;
}

export interface Datum {
  approvedTasks: any[];
  assignedTasks: any[];
  createdAt: string;
  departments: Department[];
  employeeRequests: EmployeeRequest[];
  id: string;
  performedTasks: any[];
  permissions: SupervisorPermissions[];
  promotions: any[];
  questions: any[];
  supportTicketAnswersAuthored: any[];
  updatedAt: string;
  userId: string;
  user: User;
  [property: string]: any;
}

export interface Department {
  createdAt: string;
  id: string;
  name: string;
  parentId: null;
  updatedAt: string;
  visibility: string;
  [property: string]: any;
}

export interface EmployeeRequest {
  acknowledgedBySupervisor?: boolean;
  createdAt?: string;
  id?: string;
  newEmployeeDesignation?: null;
  newEmployeeEmail?: string;
  newEmployeeFullName?: string;
  newEmployeeJobTitle?: string;
  newEmployeeUsername?: string;
  rejectionReason?: null;
  requestedBySupervisorId?: string;
  resolvedAt?: null;
  resolvedByAdminId?: null;
  status?: string;
  temporaryPassword?: string;
  updatedAt?: string;
  [property: string]: any;
}
