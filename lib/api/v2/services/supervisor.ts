// supervisor-sdk.ts
import type { AxiosInstance } from "axios";

/* ========== JSend Envelope ========== */
export interface JSendSuccess<T> {
  status: "success";
  data: T;
}

/* ========== Shared Types ========== */
export type IsoDateString = string;
export enum SupervisorPermissions {
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  MANAGE_SUB_DEPARTMENTS = "MANAGE_SUB_DEPARTMENTS",
  MANAGE_PROMOTIONS = "MANAGE_PROMOTIONS",
  VIEW_USER_ACTIVITY = "VIEW_USER_ACTIVITY",
  MANAGE_STAFF_DIRECTLY = "MANAGE_STAFF_DIRECTLY",
  MANAGE_TASKS = "MANAGE_TASKS",
  MANAGE_ATTACHMENT_GROUPS = "MANAGE_ATTACHMENT_GROUPS",
}

/* ========== Supervisor Entity ========== */
export interface Supervisor {
  id: string;
  userId: string;
  permissions: SupervisorPermissions[];
  departments: Department[];
  assignedTasks: any[];
  employeeRequests: any[];
  promotions: any[];
  approvedTasks: any[];
  questions: any[];
  supportTicketAnswersAuthored: any[];
  performedTasks: any[];
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface SupervisorSummary {
  name: string;
  profilePicture: string;
  username: string;
  id: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface DelegateSupervisorRequest {
  fromSupervisorUserId: string;
  toSupervisorUserId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "SUPERVISOR" | "ADMIN" | "EMPLOYEE" | "DRIVER";
  employeeId?: string;
  jobTitle: string;
  profilePicture?: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

/* ========== Add Supervisor by Admin ========== */
export interface AddSupervisorByAdminRequest {
  name: string;
  email: string;
  employeeId?: string;
  jobTitle: string;
  departmentIds: string[];
  permissions: SupervisorPermissions[];
}

export interface AddSupervisorByAdminData {
  message: string;
  invitation: SupervisorInvitationStatus;
}

/* ========== Search Supervisors ========== */
export interface SearchSupervisorsQuery {
  search: string;
}

export interface SearchSupervisorsData {
  supervisors: Supervisor[];
}

/* ========== Can Delete Supervisor ========== */
export interface CanDeleteSupervisorData {
  canDelete: boolean;
  reason?: string;
}

/* ========== Delete Supervisor ========== */
export interface DeleteSupervisorData {
  message: string;
  deletedSupervisor: {
    id: string;
    name: string;
    email: string;
  };
}

/* ========== Update Supervisor ========== */
export interface UpdateSupervisorRequest {
  name?: string;
  email?: string;
  employeeId?: string;
  jobTitle?: string;
  departmentIds?: string[];
  permissions?: SupervisorPermissions[];
}

export interface UpdateSupervisorData {
  message: string;
  supervisor: Supervisor;
  user: User;
}

/* ========== Supervisor Invitation ========== */
export interface GetSupervisorInvitationQuery {
  token: string;
}

export interface GetSupervisorInvitationData {
  name: string;
  email: string;
  employeeId?: string;
  jobTitle: string;
  departmentNames: string[];
  permissions: SupervisorPermissions[];
  expiresAt: IsoDateString;
}

export interface CompleteSupervisorInvitationRequest {
  token: string;
  username: string;
  name: string;
  password: string;
  uploadProfilePicture?: boolean;
}

export interface CompleteSupervisorInvitationData {
  message: string;
  supervisor: Supervisor;
  user: User;
  uploadKey?: string;
  uploadKeyExpiresAt?: IsoDateString;
}

/* ========== Supervisor Invitations List ========== */
export interface GetSupervisorInvitationsQuery {
  status?: "pending" | "completed" | "expired";
  page?: number;
  limit?: number;
}

export interface SupervisorInvitationStatus {
  token: string;
  name: string;
  email: string;
  employeeId?: string;
  jobTitle: string;
  departmentNames: string[];
  permissions: SupervisorPermissions[];
  status: "pending" | "completed" | "expired";
  createdAt: IsoDateString;
  expiresAt: IsoDateString;
}

export interface GetSupervisorInvitationsData {
  invitations: SupervisorInvitationStatus[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ========== Services ========== */
export class SupervisorService {
  constructor(private readonly http: AxiosInstance) { }

  async addByAdmin(
    request: AddSupervisorByAdminRequest
  ): Promise<AddSupervisorByAdminData> {
    const res = await this.http.post<JSendSuccess<AddSupervisorByAdminData>>(
      "/supervisors",
      request
    );
    return res.data.data;
  }

  async delegate(request: DelegateSupervisorRequest): Promise<null> {
    const res = await this.http.post<JSendSuccess<null>>(
      "/supervisors/delegate",
      request
    );
    return res.data.data;
  }

  async search(query: SearchSupervisorsQuery): Promise<SearchSupervisorsData> {
    const res = await this.http.get<JSendSuccess<SearchSupervisorsData>>(
      "/supervisors/search",
      { params: { search: query.search } }
    );
    return res.data.data;
  }

  async getSummaries(departmentIds?: string[]): Promise<SupervisorSummary[]> {
    const res = await this.http.get<JSendSuccess<SupervisorSummary[]>>(
      "/supervisors/summaries",
      { params: { departmentIds } }
    );
    return res.data.data;
  }

  async canDelete(id: string): Promise<CanDeleteSupervisorData> {
    const res = await this.http.get<JSendSuccess<CanDeleteSupervisorData>>(
      `/supervisors/can-delete/${id}`
    );
    return res.data.data;
  }

  async delete(id: string): Promise<DeleteSupervisorData> {
    const res = await this.http.delete<JSendSuccess<DeleteSupervisorData>>(
      `/supervisors/${id}`
    );
    return res.data.data;
  }

  async update(
    id: string,
    request: UpdateSupervisorRequest
  ): Promise<UpdateSupervisorData> {
    const res = await this.http.put<JSendSuccess<UpdateSupervisorData>>(
      `/supervisors/${id}`,
      request
    );
    return res.data.data;
  }
}

export class SupervisorInvitationService {
  constructor(private readonly http: AxiosInstance) { }

  async getInvitation(
    query: GetSupervisorInvitationQuery
  ): Promise<GetSupervisorInvitationData> {
    const res = await this.http.get<JSendSuccess<GetSupervisorInvitationData>>(
      "/supervisor/invitation",
      { params: { token: query.token } }
    );
    return res.data.data;
  }

  async completeInvitation(
    request: CompleteSupervisorInvitationRequest
  ): Promise<CompleteSupervisorInvitationData> {
    const res = await this.http.post<
      JSendSuccess<CompleteSupervisorInvitationData>
    >("/supervisor/invitation/complete", request);
    return res.data.data;
  }

  async getInvitations(
    query?: GetSupervisorInvitationsQuery
  ): Promise<GetSupervisorInvitationsData> {
    const res = await this.http.get<JSendSuccess<GetSupervisorInvitationsData>>(
      "/supervisor/invitations",
      { params: query }
    );
    return res.data.data;
  }

  async deleteInvitation(
    token: string
  ): Promise<void> {
    return await this.http.delete(`/supervisor/invitations/${token}`)
  }
}

/* ========== Factories ========== */
export interface SupervisorServices {
  supervisor: SupervisorService;
  invitation: SupervisorInvitationService;
}

export function createSupervisorServices(
  http: AxiosInstance
): SupervisorServices {
  return {
    supervisor: new SupervisorService(http),
    invitation: new SupervisorInvitationService(http),
  };
}

export const createSupervisorService = (http: AxiosInstance) =>
  new SupervisorService(http);

export const createSupervisorInvitationService = (http: AxiosInstance) =>
  new SupervisorInvitationService(http);
