import {
  GetAllTasksParams,
  GetDelegationsForEmployeeParams,
  GetDelegationsForSubDepartmentParams,
  GetDelegationsForTaskParams,
  GetDepartmentLevelTasksParams,
  GetIndividualLevelTasksParams,
  GetMyDelegationsParams,
  GetMyTasksParams,
  GetSubDepartmentTasksParams,
  GetTaskPresetsParams,
  GetTasksWithFiltersParams,
  GetTeamTasksForSupervisorParams,
  GetTeamTasksParams,
} from "./types";

export const taskKeys = {
  all: ["tasks"] as const,

  // ── Core ─────────────────────────────────────────────────────────────
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  count: () => [...taskKeys.all, "count"] as const,

  // ── Querying ─────────────────────────────────────────────────────────
  myTasks: (params: GetMyTasksParams) =>
    [...taskKeys.all, "my-tasks", params] as const,
  teamTasks: (params: GetTeamTasksParams) =>
    [...taskKeys.all, "team-tasks", params] as const,
  teamTasksSupervisor: (params: GetTeamTasksForSupervisorParams) =>
    [...taskKeys.all, "team-tasks-supervisor", params] as const,
  departmentLevel: (params: GetDepartmentLevelTasksParams) =>
    [...taskKeys.all, "department-level", params] as const,
  subDepartmentLevel: (params: GetSubDepartmentTasksParams) =>
    [...taskKeys.all, "sub-department-level", params] as const,
  individualLevel: (params: GetIndividualLevelTasksParams) =>
    [...taskKeys.all, "individual-level", params] as const,
  withFilters: (params: GetTasksWithFiltersParams) =>
    [...taskKeys.all, "with-filters", params] as const,
  allTasks: (params: GetAllTasksParams) =>
    [...taskKeys.all, "all", params] as const,

  // ── Submissions ──────────────────────────────────────────────────────
  submissions: () => [...taskKeys.all, "submissions"] as const,
  submission: (id: string) => [...taskKeys.submissions(), id] as const,
  submissionsByTask: (taskId: string) =>
    [...taskKeys.submissions(), "by-task", taskId] as const,

  // ── Delegations ──────────────────────────────────────────────────────
  delegations: () => [...taskKeys.all, "delegations"] as const,
  delegation: (id: string) => [...taskKeys.delegations(), id] as const,
  myDelegations: (params: GetMyDelegationsParams) =>
    [...taskKeys.delegations(), "my", params] as const,
  employeeDelegations: (params: GetDelegationsForEmployeeParams) =>
    [...taskKeys.delegations(), "employee", params] as const,
  taskDelegations: (taskId: string, params: GetDelegationsForTaskParams) =>
    [...taskKeys.delegations(), "task", taskId, params] as const,
  subDeptDelegations: (
    subDeptId: string,
    params: GetDelegationsForSubDepartmentParams,
  ) =>
    [...taskKeys.delegations(), "sub-department", subDeptId, params] as const,
  delegables: (search?: string) =>
    [...taskKeys.delegations(), "delegables", search] as const,

  // ── Presets ──────────────────────────────────────────────────────────
  presets: () => [...taskKeys.all, "presets"] as const,
  presetList: (params: GetTaskPresetsParams) =>
    [...taskKeys.presets(), params] as const,

  // ── Visibility ───────────────────────────────────────────────────────
  visibility: () => [...taskKeys.all, "visibility"] as const,
  tasksVisibility: () => [...taskKeys.visibility(), "all"] as const,
  taskVisibility: (taskId: string) =>
    [...taskKeys.visibility(), taskId] as const,
};
