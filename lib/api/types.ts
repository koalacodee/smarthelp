// =======================
// Enums
// =======================
export enum UserRole {
  SUPERVISOR = "SUPERVISOR",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  DRIVER = "DRIVER",
  GUEST = "GUEST",
}

export enum TaskStatus {
  TODO = "TODO",
  SEEN = "SEEN",
  PENDING_REVIEW = "PENDING_REVIEW",
  PENDING_SUPERVISOR_REVIEW = "PENDING_SUPERVISOR_REVIEW",
  COMPLETED = "COMPLETED",
}

export enum Rating {
  SATISFIED = "SATISFIED",
  NEUTRAL = "NEUTRAL",
  DISSATISFIED = "DISSATISFIED",
}

export enum ViolationType {
  SPEEDING = "SPEEDING",
  MISSED_MAINTENANCE = "MISSED_MAINTENANCE",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum AudienceType {
  CUSTOMER = "CUSTOMER",
  SUPERVISOR = "SUPERVISOR",
  EMPLOYEE = "EMPLOYEE",
  ALL = "ALL",
}

export enum EmployeePermissions {
  HANDLE_TICKETS = "HANDLE_TICKETS",
  HANDLE_TASKS = "HANDLE_TASKS",
  ADD_FAQS = "ADD_FAQS",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  CLOSE_TICKETS = "CLOSE_TICKETS",
}

export enum AdminPermissions {
  VIEW_ALL_DASHBOARD = "VIEW_ALL_DASHBOARD",
  MANAGE_DEPARTMENTS = "MANAGE_DEPARTMENTS",
  MANAGE_PROMOTIONS = "MANAGE_PROMOTIONS",
  APPROVE_STAFF_REQUESTS = "APPROVE_STAFF_REQUESTS",
  MANAGE_SITE_CONFIG = "MANAGE_SITE_CONFIG",
  MANAGE_SUPERVISORS = "MANAGE_SUPERVISORS",
  VIEW_USER_ACTIVITY = "VIEW_USER_ACTIVITY",
  MANAGE_STAFF_DIRECTLY = "MANAGE_STAFF_DIRECTLY",
}

export enum VehicleLicenseStatus {
  ACTIVE = "ACTIVE",
  EXPIRING_SOON = "EXPIRING_SOON",
  EXPIRED = "EXPIRED",
}

// =======================
// Core User & Roles
// =======================
export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId?: string;
}

export interface Employee {
  id: string;
  userId: string;
  user?: User;
  supervisorId: string;
  supervisor?: Supervisor;
  permissions: EmployeePermissions[];
  assigneeTasks?: Task[];
  performerTasks?: Task[];
  questions?: Question[];
  supportTicketAnswersAssigned?: SupportTicket[];
  supportTicketAnswersAuthored?: SupportTicketAnswer[];
}

export interface Supervisor {
  id: string;
  userId: string;
  permissions: AdminPermissions[];
  departments: Department[];
  assignedTasks: Task[];
  approvedTasks: Task[];
  employeeRequests: EmployeeRequest[];
  promotions: Promotion[];
  questions: Question[];
  supportTicketAnswersAuthored: SupportTicketAnswer[];
  performedTasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id?: string;
  userId: string;
  user?: User;
  promotions?: Promotion[];
  approvedTasks?: Task[];
  adminResolutions?: EmployeeRequest[];
  questions?: Question[];
  supportTicketAnswersAuthored?: SupportTicketAnswer[];
  performerTasks?: Task[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Guest {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  supportTickets?: SupportTicket[];
  createdAt?: Date;
  updatedAt?: Date;
}

// =======================
// Department & Knowledge
// =======================
export interface Department {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  subDepartments: Department[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  departmentId: string;
  answer?: string;
  knowledgeChunkId?: string;
  creatorAdminId?: string;
  creatorSupervisorId?: string;
  creatorEmployeeId?: string;
  createdAt: Date;
  updatedAt: Date;
  satisfaction: number;
  dissatisfaction: number;
  views: number;
}

export interface KnowledgeChunk {
  id?: string;
  content: string;
  department: Department;
}

// =======================
// Tasks
// =======================
export interface Task {
  id?: string;
  title: string;
  description: string;
  department: Department;
  status: TaskStatus;
  assigner: Admin | Supervisor;
  assignee?: Employee;
  approver?: Admin | Supervisor;
  performer?: Admin | Supervisor | Employee;
  notes?: string;
  feedback?: string;
  performerAttachment?: Attachment;
  assignerAttachment?: Attachment;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

// =======================
// Support Tickets
// =======================
export interface SupportTicket {
  id?: string;
  guestId: string;
  subject: string;
  description: string;
  departmentId: string;
  assignee?: Employee;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketAnswer {
  id?: string;
  supportTicket: SupportTicket;
  content: string;
  attachment?: Attachment;
  answerer: Employee | Supervisor | Admin;
  rating?: Rating;
  createdAt?: Date;
  updatedAt?: Date;
}

// =======================
// Employee Requests
// =======================
export interface EmployeeRequest {
  id?: string;
  requestedBySupervisor: User;
  status: RequestStatus;
  newEmployeeFullName?: string;
  newEmployeeDesignation?: string;
  resolvedByAdmin?: User;
  rejectionReason?: string;
  acknowledgedBySupervisor?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
}

// =======================
// Promotions
// =======================
export interface Promotion {
  id?: string;
  title: string;
  audience: AudienceType;
  isActive: boolean;
  createdByAdmin?: Admin;
  createdBySupervisor?: Supervisor;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// =======================
// Vehicles & Violations
// =======================
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  license: VehicleLicense;
  notes?: string;
  nextMaintenanceDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleLicense {
  id?: string;
  vehicle: Vehicle;
  licenseNumber: string;
  issueDate: Date;
  expiryDate: Date;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: Date;
  status: VehicleLicenseStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ViolationRule {
  id: string;
  type: ViolationType;
  threshold: number;
  fineAmount: number;
  description: string;
  isEnabled: boolean;
}

export interface Violation {
  id: string;
  vehicle: Vehicle;
  description: string;
  amount: number;
  isPaid: boolean;
  triggerEventId: string;
  createdAt: Date;
  updatedAt: Date;
}

// =======================
// Attachments
// =======================
export interface Attachment {
  id?: string;
  targetId: string;
  type: string;
  url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// =======================
// Push Subscriptions
// =======================
export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSub {
  id?: string;
  userId: string;
  endpoint: string;
  expirationTime?: Date | null;
  keys: PushSubscriptionKeys;
  createdAt?: Date;
  updatedAt?: Date;
}
