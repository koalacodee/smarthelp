import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  AnswerTicketDto,
  CreateQuestionInputDto,
  CreateKnowledgeChunkInputDto,
  UpdateKnowledgeChunkInputDto,
  LoginDto,
  UpdateQuestionInputDto,
} from "./dtos";
import { Question, User, VehicleLicenseStatus } from "./types";
import { getCookie, setCookie } from "./cookies";
import { DeepPartial } from "react-hook-form";
import { CreateTaskDto, TaskData } from "./tasks";
import { Task, Datum } from "./tasks";
import {
  CreateDepartmentInputDto,
  CreateSubDepartmentDto,
  Department,
  DepartmentsResponse,
  UpdateDepartmentInputDto,
  UpdateSubDepartmentInputDto,
} from "./departments";
import {
  EmployeeRequestsResponse,
  RejectEmployeeRequestDto,
  SubmitRequestDto,
} from "./employee-requests";
import { CreatePromotionDto } from "./promotions";
import {
  CreateSupervisorDto,
  SupervisorsResponse,
  UpdateSupervisorDto,
} from "./supervisors";
import { Entity, UpdateEmployeeDto } from "./employees";
import { CreateDriverDto } from "./drivers";
import { ApiResponse } from "@/app/(dashboard)/user-activity/components/UserActivityReport";
import {
  PerformanceTicket,
  PerformanceUser,
} from "@/app/(dashboard)/user-activity/components/UserPerformanceTable";
import { env } from "next-runtime-env";
import { Configuration, KnowledgeChunkApiFactory } from "./sdk";
import {
  UploadMultipleFilesResponse,
  UploadSingleFileResponse,
} from "./v2/services/shared/upload";

const api = axios.create({
  baseURL: env("NEXT_PUBLIC_API_URL"),
  withCredentials: true,
});

const factoryArgs: [Configuration, string | undefined, AxiosInstance] = [
  new Configuration({ basePath: api.defaults.baseURL }),
  api.defaults.baseURL,
  api,
];

// Request interceptor → inject accessToken
api.interceptors.request.use(
  async (config) => {
    const accessToken = await getCookie("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await api.post<{ data: { accessToken: string } }>(
        "/auth/refresh"
      );
      const accessToken = response.data.data.accessToken;
      await setCookie("accessToken", accessToken);

      // retry original request
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

// Guest
export interface TicketGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
}

// User inside Assignee
export interface TicketUser {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "ADMIN" | "SUPERVISOR"; // extend as needed
}

// Assignee
export interface TicketAssignee {
  id: string;
  userId: string;
  user: TicketUser;
  permissions: string[]; // e.g. ["HANDLE_TICKETS", "HANDLE_TASKS"]
  supervisorId: string;
}

export interface TicketInteraction {
  type: "SATISFACTION" | "DISSATISFACTION";
}

// Main Ticket
export interface Ticket {
  id: string;
  guestId: string;
  // guest: TicketGuest;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  subject: string;
  description: string;
  departmentId: string;
  assignee: TicketAssignee;
  status: TicketStatus; // extend as needed
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
  answer?: string;
  interaction?: TicketInteraction;
  department: {
    id: string;
    name: string;
    parentId?: string;
  };
}

export interface TicketMetrics {
  totalTickets: number;
  pendingTickets: number; // NEW + SEEN statuses
  answeredTickets: number; // ANSWERED status
  closedTickets: number; // CLOSED status
}

export enum TicketStatus {
  NEW = "NEW",
  SEEN = "SEEN",
  ANSWERED = "ANSWERED",
  CLOSED = "CLOSED",
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  status: VehicleStatus; // expand if needed
  driver: {
    id: string;
    userId: string;
    user: {
      name: string;
    };
  };
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  nextMaintenanceDate: string; // ISO date string
  notes?: string;
  license: {
    id: string;
    licenseNumber: string;
    issueDate: string;
    expiryDate: string;
    insurancePolicyNumber?: string;
    insuranceExpiryDate?: string;
    status: VehicleLicenseStatus;
  };
}

export enum VehicleStatus {
  ACTIVE = "ACTIVE",
  IN_MAINTENANCE = "IN_MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

export interface DriverProfile {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    password: string; // hashed password
    role: "DRIVER"; // you can expand roles here
  };
  vehicles: Vehicle[];
  violations: any[];
}

// ------------------ 1. Category Views ------------------
export interface CategoryView {
  categoryName: string;
  views: number;
}

// ------------------ 2. Top FAQs ------------------
export interface TopFaq {
  id: number;
  question: string;
  viewCount: number;
  categoryName: string;
}

// ------------------ 3. FAQ Opportunities ------------------
export interface FaqOpportunity {
  originalCasing: string;
  categoryId: number;
  categoryName: string;
  count: number;
}

// ------------------ 4. Active Promotion ------------------
export interface ActivePromotion {
  id: number;
  title: string;
  description: string;
  startDate: string | null; // or Date if you parse it
  endDate: string | null; // or Date if you parse it
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // أضف أي حقل تاني موجود في جدول promotions
}

// ------------------ 5. Aggregated Result ------------------
export interface AnalyticsOverviewResult {
  totalViews: number;
  openTicketsCount: number;
  answeredPendingClosureCount: number;
  faqSatisfactionRate: number;

  categoryViews: CategoryView[];
  topFaqs: TopFaq[];
  faqOpportunities: FaqOpportunity[];
  activePromotion: ActivePromotion | null;
}

// Ticket Response Types
export interface TicketAttachmentsResponse {
  attachments: { [ticketId: string]: string[] };
}

export interface SupportTicketsResponse extends TicketAttachmentsResponse {
  tickets: Ticket[];
  metrics: TicketMetrics;
}

export interface TrackTicketResponse extends TicketAttachmentsResponse {
  id: string;
  code: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  question: string;
  answer?: string;
}

export const TicketsService = {
  getAllTickets: async () => {
    const response = await api.get<{
      data: SupportTicketsResponse;
    }>("/support-tickets");
    return response.data.data;
  },

  trackTicket: async (ticketCode: string) => {
    const response = await api.get<{
      data: TrackTicketResponse;
    }>(`/tickets/${ticketCode}`);
    return response.data.data;
  },

  answerTicket: async (
    ticketId: string,
    dto: AnswerTicketDto,
    formData?: FormData
  ) => {
    const data = await api
      .put<{
        data: { ticket: Ticket; uploadKey?: string };
      }>(`/support-tickets/${ticketId}/answer`, { ...dto, attach: !!formData })
      .then((res) => res.data.data);

    if (data.uploadKey && formData) {
      await FileService.upload(data.uploadKey, formData);
    }
    return data.ticket;
  },

  reopenTicket: async (id: string) => {
    return await api.put(`/support-tickets/${id}/reopen`);
  },
  closeTicket: async (id: string) => {
    return await api.put(`/support-tickets/${id}/close`);
  },
};

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  profilePicture?: string;
}

export const authService = {
  login: async (data: LoginDto) => {
    const response = await api.post<{
      data: { status: string; user: User; accessToken: string };
    }>("/auth/login", data);

    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<{
      data: UserResponse;
    }>("/auth/me");
    return response.data.data;
  },

  logout: async () => {
    return await api.post("/auth/logout");
  },
};

export const DepartmentsService = {
  getAllDepartments: async () => {
    const response = await api.get<DepartmentsResponse>("/department");
    return response.data.data;
  },
  getAllSubDepartments: async () => {
    const response = await api.get<DepartmentsResponse>(
      "/department/sub-departments"
    );
    return response.data.data;
  },
  createDepartment: async (dto: CreateDepartmentInputDto) => {
    const response = await api.post<{ data: Department }>("/department", dto);
    return response.data.data;
  },
  createSubDepartment: async (dto: CreateSubDepartmentDto) => {
    const response = await api.post<{ data: Department }>(
      "/department/sub-department",
      dto
    );
    return response.data.data;
  },
  deleteMainDepartment: async (id: string) => {
    return await api.delete(`/department/main/${id}`);
  },
  deleteSubDepartment: async (id: string) => {
    return await api.delete(`/department/sub/${id}`);
  },
  updateMainDepartment: async (id: string, dto: UpdateDepartmentInputDto) => {
    const response = await api.put<{ data: Department }>(
      `/department/main/${id}`,
      dto
    );
    return response.data.data;
  },
  updateSubDepartment: async (id: string, dto: UpdateSubDepartmentInputDto) => {
    const response = await api.put<{ data: Department }>(
      `/department/sub/${id}`,
      dto
    );
    return response.data.data;
  },
  canDeleteMainDepartment: async (id: string) => {
    return await api
      .get<{ data: boolean }>(`/department/can-delete/main/${id}`)
      .then((res) => res.data.data);
  },
  canDeleteSubDepartment: async (id: string) => {
    return await api
      .get<{ data: boolean }>(`/department/can-delete/sub/${id}`)
      .then((res) => res.data.data);
  },
  shareDepartment: async (id: string) => {
    return await api
      .post<{ data: { key: string } }>(`/department/share/${id}`)
      .then((res) => res.data.data.key);
  },
};

// Notification types from the backend
type NotificationType =
  | "staff_request_created"
  | "staff_request_resolved"
  | "task_created"
  | "task_approved"
  | "task_rejected"
  | "task_submitted"
  | "ticket_assigned"
  | "ticket_created"
  | "ticket_reopened"
  | "ticket_opened";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  data: {
    notifications: AppNotification[];
    counts: { [key: string]: number };
  };
}

export const NotificationService = {
  getAll: async () => {
    return api
      .get<NotificationResponse>("/notification")
      .then((res) => res.data.data);
  },
};

// FAQ Response Types
export interface FAQAttachmentsResponse {
  attachments: { [questionId: string]: string[] };
}

export interface SingleFAQResponse extends FAQAttachmentsResponse {
  question: Question | null;
}

export interface MultipleFAQsResponse extends FAQAttachmentsResponse {
  questions: Question[];
}

export interface GroupedFAQsResponse extends FAQAttachmentsResponse {
  questions: any[];
}

export interface ViewFAQsResponse extends FAQAttachmentsResponse {
  faqs: any[];
}

export interface SharedFAQsResponse extends FAQAttachmentsResponse {
  faqs: any[];
}

export interface GroupQuestionsResponse extends FAQAttachmentsResponse {
  groupedQuestions: any[];
}

export const FAQsService = {
  deleteQuestion: async (questionId: string) => {
    await api.delete(`/questions/${questionId}`);
  },
  createQuestion: async (dto: CreateQuestionInputDto, formData?: FormData) => {
    const res = await api.post<{
      data: { question: Question; uploadKey?: string };
    }>("/questions", {
      ...dto,
      attach: !!formData,
    });

    if (res.data.data.uploadKey && formData) {
      await FileService.upload(res.data.data.uploadKey, formData);
    }
    return res.data.data.question;
  },
  updateQuestion: async (
    id: string,
    dto: UpdateQuestionInputDto,
    formData?: FormData
  ) => {
    const res = await api.put<{
      data: { question: Question; uploadKey?: string };
    }>(`/questions/${id}`, {
      ...dto,
      attach: !!formData,
    });

    if (res.data.data.uploadKey && formData) {
      await FileService.upload(res.data.data.uploadKey, formData);
    }
    return res.data.data.question;
  },
  getQuestion: async (id: string) => {
    const response = await api.get<{ data: SingleFAQResponse }>(
      `/questions/${id}`
    );
    return response.data.data;
  },
  getAllQuestions: async () => {
    const response = await api.get<{ data: MultipleFAQsResponse }>(
      "/questions"
    );
    return response.data.data;
  },
  getViewFAQs: async () => {
    const response = await api.get<{ data: ViewFAQsResponse }>(
      "/questions/view"
    );
    return response.data.data;
  },
  getGrouped: async () => {
    const response = await api.get<{ data: GroupedFAQsResponse }>(
      "/questions/grouped"
    );
    return response.data.data;
  },
  getShared: async () => {
    const response = await api.get<{ data: SharedFAQsResponse }>(
      "/questions/shared"
    );
    return response.data.data;
  },
  getGroup: async () => {
    const response = await api.get<{ data: GroupQuestionsResponse }>(
      "/questions/group"
    );
    return response.data.data;
  },
};

export interface VehicleDto {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  status: Vehicle["status"]; // VehicleStatus
  assignedDriverId: string; // optional per spec
  notes?: string;
  nextMaintenanceDate?: string;
  license: {
    licenseNumber: string;
    licenseIssueDate: string;
    licenseExpiryDate: string;
    insurancePolicyNumber?: string;
    insuranceExpiryDate?: string;
  };
}

export const VehiclesService = {
  getAllVehicles: async () => {
    const response = await api.get<{ data: Vehicle[] }>("/vehicles");
    return response.data.data;
  },
  addVehicle: async (dto: VehicleDto) => {
    const response = await api.post<{ data: Vehicle }>("/vehicles", dto);
    return response.data.data;
  },
  updateVehicle: async (id: string, dto: DeepPartial<VehicleDto>) => {
    const response = await api.put<{ data: Vehicle }>(`/vehicles/${id}`, dto);
    return response.data.data;
  },
  deleteVehicle: async (id: string) => {
    return api.delete(`/vehicles/${id}`);
  },
};

export const DriversService = {
  getAllDrivers: async () => {
    const response = await api.get("/drivers");
    return response.data.data;
  },
  createDriver: async (dto: CreateDriverDto) => {
    const response = await api.post("/drivers/supervisor/add", dto);
    return response.data.data;
  },
};

// Task Response Types
export interface TaskAttachmentsResponse {
  attachments: { [taskId: string]: string[] };
}

export interface SingleTaskResponse extends TaskAttachmentsResponse {
  task: Task;
}

export interface MultipleTasksResponse extends TaskAttachmentsResponse {
  tasks: Task[];
}

export interface MyTasksResponse extends TaskAttachmentsResponse {
  data: Task[];
  total: number;
  canSubmitWork: boolean[];
  metrics: {
    pendingCount: number;
    completedCount: number;
    completionPercentage: number;
  };
}

export interface DepartmentLevelTaskData
  extends TaskData<Omit<Task, "targetSubDepartment">> {
  attachments: { [taskId: string]: string[] };
}

export interface SubDepartmentLevelTaskData
  extends TaskData<Omit<Task, "targetDepartment">> {
  attachments: { [taskId: string]: string[] };
}

export interface EmployeeLevelTaskData extends TaskData<Datum> {
  attachments: { [taskId: string]: string[] };
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  departmentId?: string;
  assigneeId?: string;
  assignerId?: string;
  approverId?: string | null;
  targetDepartmentId?: string;
  targetSubDepartmentId?: string;
  completedAt?: Date | null;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  notes?: string | null;
  feedback?: string | null;
  attach?: boolean;
  deleteAttachments?: string[];
  reminderInterval?: number;
}

// Interface for a single Task Submission
export interface TaskSubmission {
  id: string;
  taskId: string;
  performerId: string;
  performerType: "admin" | "employee" | "supervisor"; // union type since it's limited
  performerName: string;
  notes: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED"; // assuming possible statuses
  submittedAt: string; // ISO date string
}

// Interface for the overall response
export interface TaskSubmissionsResponse {
  taskSubmissions: TaskSubmission[];
  attachments: Record<string, string[]>;
}

/**
 * Approve Task Submission Request
 */
export interface ApproveTaskSubmissionRequest {
  taskSubmissionId: string;
  feedback?: string;
}

/**
 * Reject Task Submission Request
 */
export interface RejectTaskSubmissionRequest {
  taskSubmissionId: string;
  feedback?: string;
}

export const TasksService = {
  getDepartmentLevel: async () => {
    const response = await api.get<{
      data: DepartmentLevelTaskData;
    }>("/tasks/admin/department-level");
    return response.data.data;
  },
  getSubDepartmentLevel: async () => {
    const response = await api.get<{
      data: SubDepartmentLevelTaskData;
    }>("/tasks/supervisor/sub-department");
    return response.data.data;
  },
  getEmployeeLevel: async () => {
    const response = await api.get<{ data: EmployeeLevelTaskData }>(
      "/tasks/supervisor/employee-level"
    );
    return response.data.data;
  },
  createTask: async (dto: CreateTaskDto, formData?: FormData) => {
    const response = await api.post<{
      data: { task: Datum; uploadKey?: string };
    }>("/tasks", {
      ...dto,
      attach: !!formData,
    });

    let uploaded:
      | UploadMultipleFilesResponse
      | UploadSingleFileResponse
      | undefined = undefined;

    if (response.data.data.uploadKey && formData) {
      uploaded = (
        await FileService.upload(response.data.data.uploadKey, formData)
      )?.data;
    }
    return { task: response.data.data.task, uploaded };
  },
  deleteTask: async (id: string) => {
    return api.delete(`/tasks/${id}`);
  },
  submitWork: async (
    id: string,
    dto: { notes: string },
    formData?: FormData
  ) => {
    const response = await api.post<{
      data: { task: Datum; uploadKey?: string };
    }>(`tasks/${id}/submit-review`, {
      ...dto,
      attach: !!formData,
    });

    if (response.data.data.uploadKey && formData) {
      await FileService.upload(response.data.data.uploadKey, formData);
    }
    return response.data.data.task;
  },
  getTask: async (id: string) => {
    const response = await api.get<{ data: SingleTaskResponse }>(
      `/tasks/${id}`
    );
    return response.data.data;
  },
  getAllTasks: async () => {
    const response = await api.get<{ data: MultipleTasksResponse }>("/tasks");
    return response.data.data;
  },
  getMyTasks: async () => {
    const response = await api.get<{ data: MyTasksResponse }>(
      "/tasks/my-tasks"
    );
    return response.data.data;
  },
  approveTask: async (taskId: string) => {
    return api
      .post<{ data: Datum }>(`/tasks/${taskId}/approve`)
      .then((res) => res.data.data);
  },
  rejectTask: async (taskId: string, feedback?: string) => {
    return api
      .post<{ data: Datum }>(`/tasks/${taskId}/reject`, { feedback })
      .then((res) => res.data.data);
  },
  updateTask: async (id: string, dto: UpdateTaskDto, formData?: FormData) => {
    const response = await api.put<{
      data: {
        task: Datum;
        uploadKey?: string;
      };
    }>(`/tasks/${id}`, {
      ...dto,
      attach: !!formData,
    });
    let uploaded:
      | UploadMultipleFilesResponse
      | UploadSingleFileResponse
      | undefined = undefined;

    if (response.data.data.uploadKey && formData) {
      uploaded = (
        await FileService.upload(response.data.data.uploadKey, formData)
      )?.data;
    }
    return { task: response.data.data.task, uploaded };
  },
  getTaskSubmissions: async (taskId: string) => {
    const response = await api.get<{ data: TaskSubmissionsResponse }>(
      `/task/submission/task/${taskId}`
    );
    return response.data.data;
  },
  /**
   * Approve a task submission
   * POST /task/submission/approve
   */
  approveTaskSubmission: async (
    data: ApproveTaskSubmissionRequest
  ): Promise<any> => {
    const response: AxiosResponse<any> = await api.post(
      "/task/submission/approve",
      data
    );
    return response.data;
  },

  /**
   * Reject a task submission
   * POST /task/submission/reject
   */
  rejectTaskSubmission: async (
    data: RejectTaskSubmissionRequest
  ): Promise<any> => {
    const response: AxiosResponse<any> = await api.post(
      "/task/submission/reject",
      data
    );
    return response.data;
  },
  markTaskAsSeen: async (taskId: string) => {
    const response: AxiosResponse<any> = await api.post(
      `/tasks/${taskId}/seen`
    );
    return response.data;
  },
};

export const EmployeeRequestsService = {
  submitEmployeeRequest: async (dto: SubmitRequestDto) => {
    const response = await api.post("/employee-requests", dto);
    return response.data.data;
  },
  approveEmployeeRequest: async (id: string) => {
    const response = await api.patch(`/employee-requests/${id}/approve`);
    return response.data.data;
  },
  rejectEmployeeRequest: async (id: string, dto: RejectEmployeeRequestDto) => {
    const response = await api.patch(`/employee-requests/${id}/reject`, dto);
    return response.data.data;
  },
  getEmployeeRequestsForSupervisor: async (supervisorId: string) => {
    const response = await api.get<EmployeeRequestsResponse>(
      "/employee-requests",
      { params: { supervisorId } }
    );
    return response.data.data;
  },
  getPendingEmployeeRequests: async () => {
    const response = await api.get<EmployeeRequestsResponse>(
      "/employee-requests",
      { params: { statuses: ["PENDING"] } }
    );
    return response.data.data;
  },
  getResolvedEmployeeRequests: async () => {
    const response = await api.get<EmployeeRequestsResponse>(
      "/employee-requests",
      { params: { statuses: ["APPROVED", "REJECTED"] } }
    );
    return response.data.data;
  },
};

// Promotion Response Types
export interface PromotionAttachmentsResponse {
  attachments: { [promotionId: string]: string[] };
}

export interface SinglePromotionResponse extends PromotionAttachmentsResponse {
  promotion: any; // Replace 'any' with proper Promotion type if available
}

export interface MultiplePromotionsResponse
  extends PromotionAttachmentsResponse {
  promotions: any[]; // Replace 'any[]' with proper Promotion[] type if available
}

export const PromotionService = {
  createPromotion: async (dto: CreatePromotionDto, formData?: FormData) => {
    const response = await api.post<{
      data: { promotion: any; uploadKey?: string };
    }>("/promotions", {
      ...dto,
      attach: !!formData,
    });

    if (response.data.data.uploadKey && formData) {
      await FileService.upload(response.data.data.uploadKey, formData);
    }
    return response.data.data.promotion;
  },
  getPromotion: async (id: string) => {
    const response = await api.get<{ data: SinglePromotionResponse }>(
      `/promotions/${id}`
    );
    return response.data.data;
  },
  getAllPromotions: async () => {
    const response = await api.get<{ data: MultiplePromotionsResponse }>(
      "/promotions"
    );
    return response.data.data;
  },
};

export const SupervisorsService = {
  createSupervisor: async (dto: CreateSupervisorDto) => {
    const resp = await api.post("/supervisors", dto);
    return resp.data.data;
  },
  getSupervisors: async () => {
    const response = await api.get<SupervisorsResponse>("/supervisors/search");
    return response.data.data;
  },
  updateSupervisor: async (id: string, dto: UpdateSupervisorDto) => {
    const response = await api.put(`/supervisors/${id}`, dto);
    return response.data.data;
  },
  canDelete: async (id: string) => {
    const response = await api.get<{ data: boolean }>(
      `/supervisors/can-delete/${id}`
    );
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/supervisors/${id}`);
    return response.data.data;
  },
};

export const EmployeeService = {
  getEmployeesBySubDepartment: async (subDepartmentId: string) => {
    const response = await api.get<{ data: { employees: TicketAssignee[] } }>(
      "/employees/sub-department/" + subDepartmentId
    );
    return response.data.data.employees;
  },
  getAllEmployees: async () => {
    const response = await api.get<{ data: { employees: Entity[] } }>(
      "/employees"
    );
    return response.data.data.employees;
  },
  updateEmployee: async (id: string, dto: UpdateEmployeeDto) => {
    const response = await api.put(`/employees/${id}`, dto);
    return response.data.data;
  },
  canDeleteEmployee: async (id: string) => {
    const response = await api.get<{ data: boolean }>(
      `/employees/can-delete/${id}`
    );
    return response.data.data;
  },
  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data.data;
  },
};

export const UserActivityService = {
  getUserActivity: async () => {
    const response = await api.get<ApiResponse>("/activity-log/feed");
    return response;
  },
  getPerformance: async () => {
    const response = await api.get<{
      data: { tickets: PerformanceTicket[]; users: PerformanceUser[] };
    }>("/activity-log/performance");
    return response.data.data;
  },
  getAnalyticsOverview: async () => {
    const response = await api.get<{ data: AnalyticsOverviewResult }>(
      "/activity-log/analytics-overview"
    );
    return response.data.data;
  },
};

interface AttachmentMetadataResponse {
  data: {
    fileType: string;
    originalName: string;
    sizeInBytes: number;
    expiryDate: string;
    contentType: string;
  };
}

export const FileService = {
  upload: async (uploadKey: string, data: FormData) => {
    if (!data.has("file") && !data.has("files")) {
      return null;
    }
    if (data.has("files")) {
      return api.post<UploadMultipleFilesResponse>("/files/multiple", data, {
        headers: { "x-upload-key": uploadKey },
      });
    } else {
      return api.post<UploadSingleFileResponse>("/files/single", data, {
        headers: { "x-upload-key": uploadKey },
      });
    }
  },

  getAttachmentMetadata: async (tokenOrId: string) => {
    const res = await api.get<AttachmentMetadataResponse>(
      `/attachment/${tokenOrId}/metadata`
    );
    return res.data.data;
  },
};

// Knowledge Chunk Response Types
export interface KnowledgeChunkAttachmentsResponse {
  attachments: { [chunkId: string]: string[] };
}

export interface SingleKnowledgeChunkResponse
  extends KnowledgeChunkAttachmentsResponse {
  knowledgeChunk: any | null; // Replace 'any' with proper KnowledgeChunk type if available
}

export interface MultipleKnowledgeChunksResponse
  extends KnowledgeChunkAttachmentsResponse {
  knowledgeChunks: any[]; // Replace 'any[]' with proper KnowledgeChunk[] type if available
}

export const KnowledgeChunksService = {
  ...KnowledgeChunkApiFactory(...factoryArgs),

  createKnowledgeChunk: async (
    dto: CreateKnowledgeChunkInputDto,
    formData?: FormData
  ) => {
    const response = await api.post<{
      data: { knowledgeChunk: any; uploadKey?: string };
    }>("/knowledge-chunks", {
      ...dto,
      attach: !!formData,
    });

    if (response.data.data.uploadKey && formData) {
      await FileService.upload(response.data.data.uploadKey, formData);
    }
    return response.data.data.knowledgeChunk;
  },

  updateKnowledgeChunk: async (
    id: string,
    dto: UpdateKnowledgeChunkInputDto,
    formData?: FormData
  ) => {
    const response = await api.put<{
      data: { knowledgeChunk: any; uploadKey?: string };
    }>(`/knowledge-chunks/${id}`, {
      ...dto,
      attach: !!formData,
    });

    if (response.data.data.uploadKey && formData) {
      await FileService.upload(response.data.data.uploadKey, formData);
    }
    return response.data.data.knowledgeChunk;
  },

  getKnowledgeChunk: async (id: string) => {
    const response = await api.get<{ data: SingleKnowledgeChunkResponse }>(
      `/knowledge-chunks/${id}`
    );
    return response.data.data;
  },

  getAllKnowledgeChunks: async () => {
    const response = await api.get<{ data: MultipleKnowledgeChunksResponse }>(
      "/knowledge-chunks"
    );
    return response.data.data;
  },
};

export default {
  client: api,
  authService,
  FAQsService,
  DepartmentsService,
  TicketsService,
  VehiclesService,
  DriversService,
  TasksService,
  EmployeeRequestsService,
  PromotionService,
  EmployeeService,
  UserActivityService,
  FileService,
};
