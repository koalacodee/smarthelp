export enum DepartmentVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface CreateDepartmentInputDto {
  name: string;
  visibility: DepartmentVisibility;
}

export interface CreateSubDepartmentDto {
  parentId: string;
  name: string;
}

export class UpdateDepartmentInputDto {
  name?: string;
  visibility?: DepartmentVisibility;
}

export class UpdateSubDepartmentInputDto {
  name?: string;
  parentId?: string;
}

export interface DepartmentsResponse {
  data: Department[];
  status: string;
}

export interface Department {
  id: string;
  name: string;
  visibility: DepartmentVisibility;
  parent?: Department;
}
