// Shared structures
type Visibility = "PUBLIC" | "PRIVATE";

type DepartmentBase = {
  id: string;
  name: string;
  visibility: Visibility;
  questions: any[]; // refine if you know exact type
  knowledgeChunks: any[]; // refine if you know exact type
  subDepartments: any[];
};

// Department target
type DepartmentTarget = DepartmentBase;

// SubDepartment target
type SubDepartmentTarget = DepartmentBase & {
  parentId: string;
};

// Task when assignmentType = "DEPARTMENT"
type DepartmentTask = {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "PENDING_SUPERVISOR_REVIEW" | "COMPLETED"; // extend if needed
  assignmentType: "DEPARTMENT";
  targetDepartment: DepartmentTarget;
  approvalLevel: "DEPARTMENT_LEVEL";
  createdAt: string;
  updatedAt: string;
  canSubmitWork: boolean;
  notes?: string;
  dueDate: string;
  priority: "MEDIUM" | "LOW" | "HIGH";
};

// Task when assignmentType = "SUB_DEPARTMENT"
type SubDepartmentTask = {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "PENDING_SUPERVISOR_REVIEW" | "COMPLETED";
  assignmentType: "SUB_DEPARTMENT";
  targetSubDepartment: SubDepartmentTarget;
  approvalLevel: "SUB_DEPARTMENT_LEVEL";
  createdAt: string;
  updatedAt: string;
  canSubmitWork: boolean;
  notes?: string;
  dueDate: string;
  priority: "MEDIUM" | "LOW" | "HIGH";
};

// Union of tasks
type Task = DepartmentTask | SubDepartmentTask;

// Metrics
type Metrics = {
  pendingCount: number;
  completedCount: number;
  completionPercentage: number;
};

// API Response
export type MyTasksApiResponse = {
  status: "success" | "error";
  data: {
    success: boolean;
    data: Task[];
    total: number;
    metrics: Metrics;
  };
};
