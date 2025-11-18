import type { AxiosInstance } from "axios";
import type { JSend } from "../models/jsend";
import { SubDepartment } from "@/types";

/* =========================
   Request/Response Contracts
   ========================= */

export interface UUID extends String { }

export enum EmployeePermissionsEnum {
  HANDLE_TICKETS = "HANDLE_TICKETS",
  HANDLE_TASKS = "HANDLE_TASKS",
  ADD_FAQS = "ADD_FAQS",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  CLOSE_TICKETS = "CLOSE_TICKETS",
  MANAGE_KNOWLEDGE_CHUNKS = "MANAGE_KNOWLEDGE_CHUNKS",
  MANAGE_ATTACHMENT_GROUPS = "MANAGE_ATTACHMENT_GROUPS",
}

export interface InvitationStatus {
  PENDING_APPROVAL: "PENDING_APPROVAL";
  APPROVED: "APPROVED";
  REJECTED: "REJECTED";
}

// Create Employee Direct
export interface CreateEmployeeDirectRequest {
  email: string;
  fullName: string;
  jobTitle: string;
  employeeId?: string;
  permissions: EmployeePermissionsEnum[];
  subDepartmentIds: string[];
  supervisorUserId?: string;
}

export interface CreateEmployeeDirectResponse {
  invitation: {
    token: string;
    fullName: string;
    email: string;
    employeeId?: string;
    jobTitle: string;
    subDepartmentNames: string[];
    permissions: EmployeePermissionsEnum[];
    status: string;
    createdAt: Date;
    expiresAt: Date;
  };
  message: string;
}

// Get Employee Invitation
export interface GetEmployeeInvitationResponse {
  fullName: string;
  email: string;
  employeeId?: string;
  jobTitle: string;
  supervisorName: string;
  subDepartmentNames: string[];
  permissions: string[];
  expiresAt: Date;
}

// Complete Employee Invitation
export interface CompleteEmployeeInvitationRequest {
  token: string;
  username: string;
  name: string;
  password: string;
  uploadProfilePicture?: boolean;
}

export interface CompleteEmployeeInvitationResponse {
  employee: any;
  user: any;
  accessToken: string;
  refreshToken: string;
  uploadKey?: string;
  uploadKeyExpiresAt?: Date;
}

// Request Employee Invitation
export interface RequestEmployeeInvitationRequest {
  email: string;
  fullName: string;
  jobTitle: string;
  employeeId?: string;
  permissions: EmployeePermissionsEnum[];
  subDepartmentIds: string[];
}

export interface RequestEmployeeInvitationResponse {
  request: {
    token: string;
    fullName: string;
    email: string;
    employeeId?: string;
    jobTitle: string;
    supervisorId: string;
    subDepartmentNames: string[];
    permissions: EmployeePermissionsEnum[];
    status: string;
    requestedBy: string;
    createdAt: Date;
    expiresAt: Date;
  };
  message: string;
}

// Accept Employee Invitation Request
export interface AcceptEmployeeInvitationResponse {
  message: string;
  invitationDetails: {
    token: string;
    fullName: string;
    email: string;
    jobTitle: string;
    status: string;
    approvedBy: string;
    approvedAt: Date;
  };
}

// Get All Employee Invitation Requests
export interface GetAllEmployeeInvitationRequestsRequest {
  status?: keyof InvitationStatus;
}

export interface EmployeeInvitationRequestDetails {
  token: string;
  fullName: string;
  email: string;
  employeeId?: string;
  jobTitle: string;
  supervisorId: string;
  supervisorName: string;
  subDepartmentNames: string[];
  permissions: string[];
  status: string;
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface GetAllEmployeeInvitationRequestsResponse {
  requests: EmployeeInvitationRequestDetails[];
}

// Get My Employee Invitation Requests
export interface GetMyEmployeeInvitationRequestsRequest {
  status?: keyof InvitationStatus;
}

export interface MyEmployeeInvitationRequestDetails {
  token: string;
  fullName: string;
  email: string;
  employeeId?: string;
  jobTitle: string;
  subDepartmentNames: string[];
  permissions: string[];
  status: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface GetMyEmployeeInvitationRequestsResponse {
  requests: MyEmployeeInvitationRequestDetails[];
}

// Employee Data
export interface EmployeeResponse {
  id: string;
  userId: string;
  permissions: EmployeePermissionsEnum[];
  supervisorId: string;
  // subDepartmentIds: string[];
  subDepartments: SubDepartment[];
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    jobTitle: string;
    employeeId?: string;
    profilePicture?: string | null;
    role: "ADMIN" | "SUPERVISOR" | "EMPLOYEE" | "DRIVER";
  };
}

export interface GetAllEmployeesResponse {
  employees: EmployeeResponse[];
}

// Update Employee
export interface UpdateEmployeeRequest {
  permissions?: EmployeePermissionsEnum[];
  supervisorId?: string;
  subDepartmentIds?: string[];
}

// Get Employees By Permissions
export interface GetEmployeesByPermissionsRequest {
  permissions: EmployeePermissionsEnum[];
}

export interface GetEmployeesByPermissionsResponse {
  employees: EmployeeResponse[];
}

// Get Employees By Sub Department
export interface GetEmployeesBySubDepartmentResponse {
  employees: EmployeeResponse[];
}

// Can Delete Employee
export interface CanDeleteEmployeeResponse {
  canDelete: boolean;
  reason?: string;
}

/* =========================
   Service Singleton
   ========================= */

export class EmployeeService {
  private static instances = new WeakMap<AxiosInstance, EmployeeService>();

  private constructor(private readonly http: AxiosInstance) { }

  static getInstance(http: AxiosInstance): EmployeeService {
    let inst = EmployeeService.instances.get(http);
    if (!inst) {
      inst = new EmployeeService(http);
      EmployeeService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /employees - Create employee invitation (direct admin creation)
  async createEmployeeDirect(
    body: CreateEmployeeDirectRequest
  ): Promise<CreateEmployeeDirectResponse> {
    const { data } = await this.http.post<JSend<CreateEmployeeDirectResponse>>(
      "/employees",
      body
    );
    return data.data;
  }

  // GET /employees/invitation/:token - Get invitation details
  async getEmployeeInvitation(
    token: string
  ): Promise<GetEmployeeInvitationResponse> {
    const { data } = await this.http.get<JSend<GetEmployeeInvitationResponse>>(
      `/employees/invitation/${token}`
    );
    return data.data;
  }

  // POST /employees/invitation/complete - Complete invitation registration
  async completeEmployeeInvitation(
    body: CompleteEmployeeInvitationRequest
  ): Promise<CompleteEmployeeInvitationResponse> {
    const { data } = await this.http.post<
      JSend<CompleteEmployeeInvitationResponse>
    >("/employees/invitation/complete", body);
    return data.data;
  }

  // POST /employees/invitation/request - Request employee invitation (supervisor)
  async requestEmployeeInvitation(
    body: RequestEmployeeInvitationRequest
  ): Promise<RequestEmployeeInvitationResponse> {
    const { data } = await this.http.post<
      JSend<RequestEmployeeInvitationResponse>
    >("/employees/invitation/request", body);
    return data.data;
  }

  // POST /employees/invitation/accept/:token - Accept invitation request (admin)
  async acceptEmployeeInvitationRequest(
    token: string
  ): Promise<AcceptEmployeeInvitationResponse> {
    const { data } = await this.http.post<
      JSend<AcceptEmployeeInvitationResponse>
    >(`/employees/invitation/accept/${token}`);
    return data.data;
  }

  // GET /employees/invitation/requests - Get all invitation requests (admin)
  async getAllEmployeeInvitationRequests(
    params: GetAllEmployeeInvitationRequestsRequest = {}
  ): Promise<GetAllEmployeeInvitationRequestsResponse> {
    const { data } = await this.http.get<
      JSend<GetAllEmployeeInvitationRequestsResponse>
    >("/employees/invitation/requests", { params });
    return data.data;
  }

  // GET /employees/invitation/my-requests - Get my invitation requests (supervisor)
  async getMyEmployeeInvitationRequests(
    params: GetMyEmployeeInvitationRequestsRequest = {}
  ): Promise<GetMyEmployeeInvitationRequestsResponse> {
    const { data } = await this.http.get<
      JSend<GetMyEmployeeInvitationRequestsResponse>
    >("/employees/invitation/my-requests", { params });
    return data.data;
  }

  // GET /employees - Get all employees
  async getAllEmployees(): Promise<GetAllEmployeesResponse> {
    const { data } = await this.http.get<JSend<GetAllEmployeesResponse>>(
      "/employees"
    );
    return data.data;
  }

  // GET /employees/:id - Get employee by ID
  async getEmployee(id: UUID): Promise<EmployeeResponse> {
    const { data } = await this.http.get<JSend<EmployeeResponse>>(
      `/employees/${id}`
    );
    return data.data;
  }

  // GET /employees/user/:userId - Get employee by user ID
  async getEmployeeByUserId(userId: UUID): Promise<EmployeeResponse> {
    const { data } = await this.http.get<JSend<EmployeeResponse>>(
      `/employees/user/${userId}`
    );
    return data.data;
  }

  // PUT /employees/:id - Update employee
  async updateEmployee(
    id: UUID,
    body: UpdateEmployeeRequest
  ): Promise<EmployeeResponse> {
    const { data } = await this.http.put<JSend<EmployeeResponse>>(
      `/employees/${id}`,
      body
    );
    return data.data;
  }

  // DELETE /employees/:id - Delete employee
  async deleteEmployee(id: UUID): Promise<EmployeeResponse> {
    const { data } = await this.http.delete<JSend<EmployeeResponse>>(
      `/employees/${id}`
    );
    return data.data;
  }

  // GET /employees/sub-department/:id - Get employees by sub-department
  async getEmployeesBySubDepartment(
    subDepartmentId: UUID
  ): Promise<GetEmployeesBySubDepartmentResponse> {
    const { data } = await this.http.get<
      JSend<GetEmployeesBySubDepartmentResponse>
    >(`/employees/sub-department/${subDepartmentId}`);
    return data.data;
  }

  // GET /employees/can-delete/:id - Check if employee can be deleted
  async canDeleteEmployee(id: UUID): Promise<CanDeleteEmployeeResponse> {
    const { data } = await this.http.get<JSend<CanDeleteEmployeeResponse>>(
      `/employees/can-delete/${id}`
    );
    return data.data;
  }

  // POST /employees/by-permissions - Get employees by permissions
  async getEmployeesByPermissions(
    body: GetEmployeesByPermissionsRequest
  ): Promise<GetEmployeesByPermissionsResponse> {
    const { data } = await this.http.post<
      JSend<GetEmployeesByPermissionsResponse>
    >("/employees/by-permissions", body);
    return data.data;
  }

  // DELETE /employees/invitation/:token - Delete employee invitation
  async deleteEmployeeInvitation(token: string): Promise<void> {
    return await this.http.delete(`/employees/invitation/${token}`)
  }
}

/* =========================
   Factory
   ========================= */

export function createEmployeeService(http: AxiosInstance): EmployeeService {
  return EmployeeService.getInstance(http);
}
