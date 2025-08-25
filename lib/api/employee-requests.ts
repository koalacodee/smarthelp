import { User } from "./tasks";

export interface SubmitRequestDto {
  newEmployeeEmail: string;
  newEmployeeFullName: string;
  newEmployeeJobTitle: string;
  newEmployeeUsername: string;
  temporaryPassword: string;
  newEmployeeId: string;
}

export interface EmployeeRequestsResponse {
  data: Datum[];
  status: string;
}

export interface Datum {
  acknowledgedBySupervisor?: boolean;
  createdAt?: string;
  id: string;
  newEmployeeEmail?: NewEmployeeEmail;
  newEmployeeFullName?: string;
  newEmployeeJobTitle?: string;
  newEmployeeUsername?: string;
  newEmployeeId?: string;
  requestedBySupervisor?: RequestedBySupervisor;
  status?: string;
  temporaryPassword?: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedByAdmin?: ResolvedByAdmin;
  rejectionReason?: string;
}

export interface NewEmployeeEmail {
  value: string;
}

export interface RequestedBySupervisor {
  createdAt: string;
  id: string;
  permissions: any[];
  updatedAt: string;
  userId: string;
  user?: User;
}

export interface ResolvedByAdmin {
  createdAt: string;
  id: string;
  permissions: any[];
  updatedAt: string;
  userId: string;
  user?: User;
}

export interface RejectEmployeeRequestDto {
  rejectionReason: string;
}
