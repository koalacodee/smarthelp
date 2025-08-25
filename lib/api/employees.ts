import { EmployeePermissions } from "./types";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "ADMIN" | "SUPERVISOR" | "EMPLOYEE" | "DRIVER";
  employeeId?: string;
  jobTitle?: string;
}

interface SubDepartment {
  id: string;
  name: string;
  visibility: "PUBLIC" | "PRIVATE";
  questions: any[]; // You can replace `any` with a proper type if available
  knowledgeChunks: any[]; // Replace `any` with proper type
  subDepartments: SubDepartment[]; // Recursive type
}

export interface Entity {
  id: string;
  userId: string;
  user: User;
  permissions: EmployeePermissions[];
  supervisorId: string;
  subDepartments: SubDepartment[];
}

export class UpdateEmployeeDto {
  permissions?: EmployeePermissions[];
  subDepartmentIds?: string[];
  jobTitle?: string;
  employeeId?: string;
  password?: string;
}
