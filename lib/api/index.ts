import axios from "axios";
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
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true,
});

// Request interceptor to inject the accessToken from sessionStorage
api.interceptors.request.use(
  async (config) => {
    const accessToken = await getCookie("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  async (error) => {
    throw error;
  }
);

// Response interceptor to handle 401 errors with token refresh
api.interceptors.response.use(
  async (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401, or if we've already tried to refresh, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      throw error;
    }

    // Check if the 401 is from the refresh endpoint itself
    if (originalRequest.url === "/auth/refresh") {
      throw error;
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;

    try {
      // Attempt to refresh the token
      const response = await api.post<{ data: { accessToken: string } }>(
        "/auth/refresh"
      );
      const accessToken = response.data.data.accessToken;
      await setCookie("accessToken", accessToken);

      // Retry the original request with the new token
      return await api(originalRequest);
    } catch (refreshError) {
      // If refresh fails (401 or other error), reject with the original error

      throw error;
    }
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
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

// Main Ticket
export interface Ticket {
  id: string;
  guestId: string;
  guest: TicketGuest;
  subject: string;
  description: string;
  departmentId: string;
  assignee: TicketAssignee;
  status: TicketStatus; // extend as needed
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
  answer?: string;
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

export const TicketsService = {
  getAllTickets: async () => {
    const response = await api.get<{ data: Ticket[] }>("/support-tickets");
    return response.data.data;
  },

  answerTicket: async (ticketId: string, dto: AnswerTicketDto) => {
    const response = await api.put<{ data: Ticket }>(
      `/support-tickets/${ticketId}/answer`,
      dto
    );
    return response.data.data;
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
  canDelete: async (id: string) => {
    return await api
      .get<{ data: boolean }>(`/department/can-delete/${id}`)
      .then((res) => res.data.data);
  },
};

export const FAQsService = {
  deleteQuestion: async (questionId: string) => {
    await api.delete(`/questions/${questionId}`);
  },
  createQuestion: async (dto: CreateQuestionInputDto) => {
    return api.post<{ data: Question }>("/questions", dto);
  },
  updateQuestion: async (id: string, dto: UpdateQuestionInputDto) => {
    return api.put<{ data: Question }>(`/questions/${id}`, dto);
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
    return response.data.data;
  },
  getSubDepartmentLevel: async () => {
    const response = await api.get<{
      data: TaskData<Omit<Task, "targetDepartment">>;
    }>("/tasks/supervisor/sub-department");
    return response.data.data;
  },
  getEmployeeLevel: async () => {
    const response = await api.get<{ data: TaskData<Datum> }>(
      "/tasks/supervisor/employee-level"
    );
    return response.data.data;
  },
  createTask: async (dto: CreateTaskDto) => {
    const response = await api.post<{ data: any }>("/tasks", dto);
    return response.data.data;
  },
  deleteTask: async (id: string) => {
    return api.delete(`/tasks/${id}`);
  },
  submitWork: async (id: string, dto: { notes: string }) => {
    return api.post(`tasks/${id}/submit-review`, dto);
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
};
