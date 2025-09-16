import axios, { AxiosInstance } from "axios";
import {
  AnswerTicketDto,
  CreateQuestionInputDto,
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
import { GroupedFAQs } from "@/app/(dashboard)/faqs/page";
import { ApiResponse } from "@/app/(dashboard)/user-activity/components/UserActivityReport";
import {
  PerformanceTicket,
  PerformanceUser,
} from "@/app/(dashboard)/user-activity/components/UserPerformanceTable";
import { env } from "next-runtime-env";
import { Configuration, KnowledgeChunkApiFactory } from "./sdk";
import { MyTasksApiResponse } from "./types/my-tasks.types";

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

export const TicketsService = {
  getAllTickets: async () => {
    const response = await api.get<{
      data: { tickets: Ticket[]; metrics: TicketMetrics };
    }>("/support-tickets");
    return response.data.data;
  },

  answerTicket: async (ticketId: string, dto: AnswerTicketDto, file?: File) => {
    const data = await api
      .put<{
        data: { ticket: Ticket; uploadKey?: string };
      }>(`/support-tickets/${ticketId}/answer`, { ...dto, attach: !!file })
      .then((res) => res.data.data);

    if (data.uploadKey && file) {
      const formData = new FormData();
      formData.append("file", file);
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

export const authService = {
  login: async (data: LoginDto) => {
    const response = await api.post<{
      data: { status: string; user: User; accessToken: string };
    }>("/auth/login", data);

    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<{
      data: {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
      };
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

export const FAQsService = {
  deleteQuestion: async (questionId: string) => {
    await api.delete(`/questions/${questionId}`);
  },
  createQuestion: async (dto: CreateQuestionInputDto, file?: File) => {
    const res = await api.post<{
      data: { question: Question; uploadKey?: string };
    }>("/questions", {
      ...dto,
      attach: !!file,
    });

    if (res.data.data.uploadKey && file) {
      const formData = new FormData();
      formData.append("file", file);
      await FileService.upload(res.data.data.uploadKey, formData);
    }
    return res.data.data.question;
  },
  updateQuestion: async (id: string, dto: UpdateQuestionInputDto) => {
    return api.put<{ data: Question }>(`/questions/${id}`, dto);
  },
  getGrouped: async () => {
    return api.get<{ data: GroupedFAQs[] }>("/questions/grouped");
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

export const TasksService = {
  getDepartmentLevel: async () => {
    const response = await api.get<{
      data: TaskData<Omit<Task, "targetSubDepartment">>;
    }>("/tasks/admin/department-level");
    return response.data.data.data;
  },
  getSubDepartmentLevel: async () => {
    const response = await api.get<{
      data: TaskData<Omit<Task, "targetDepartment">>;
    }>("/tasks/supervisor/sub-department");
    return response.data.data.data;
  },
  getEmployeeLevel: async () => {
    const response = await api.get<{ data: TaskData<Datum> }>(
      "/tasks/supervisor/employee-level"
    );
    return response.data.data.data;
  },
  createTask: async (dto: CreateTaskDto) => {
    const response = await api.post<{ data: Datum }>("/tasks", dto);
    return response.data.data;
  },
  deleteTask: async (id: string) => {
    return api.delete(`/tasks/${id}`);
  },
  submitWork: async (id: string, dto: { notes: string }) => {
    return api.post(`tasks/${id}/submit-review`, dto);
  },
  getMyTasks: async () => {
    const response = await api.get<MyTasksApiResponse>("/tasks/my-tasks");
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

export const PromotionService = {
  createPromotion: async (dto: CreatePromotionDto) => {
    const response = await api.post("/promotions", dto);
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

export const FileService = {
  upload: async (uploadKey: string, data: FormData) => {
    if (!data.has("file")) {
      return null;
    }
    if (Array.isArray(data.get("file"))) {
      // data.append("files", data.get("file") as File[]);
      // data.delete("file");
      // await api.post("/files/multiple", uploadFile, {
      //   headers: { "x-upload-key": uploadKey },
      // });
    } else {
      await api.post("/files/single", data, {
        headers: { "x-upload-key": uploadKey },
      });
    }
  },
};

export const KnowledgeChunksService = KnowledgeChunkApiFactory(...factoryArgs);

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
};
