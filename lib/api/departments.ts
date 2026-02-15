export enum DepartmentVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface CreateDepartmentInputDto {
  name: string;
  visibility: DepartmentVisibility;
  isExposedToTvContent?: boolean;
  knowledgeChunkContent?: string;
}

export interface CreateSubDepartmentDto {
  parentId: string;
  name: string;
}

export class UpdateDepartmentInputDto {
  name?: string;
  visibility?: DepartmentVisibility;
  isExposedToTvContent?: boolean;
}

export class UpdateSubDepartmentInputDto {
  name?: string;
  parentId?: string;
  isExposedToTvContent?: boolean;
}

export interface DepartmentsResponse {
  data: Department[];
  status: string;
}

export interface Department {
  id: string;
  name: string;
  visibility: DepartmentVisibility;
  isExposedToTvContent?: boolean;
  parent?: Department;
  parentId?: string;
}
