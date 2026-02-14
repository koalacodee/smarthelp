import { useQuery } from "@tanstack/react-query";
import { taskKeys } from "../keys";
import axios from "../axios";
import type {
  GetMyTasksParams,
  GetTeamTasksParams,
  GetTeamTasksForSupervisorParams,
  GetDepartmentLevelTasksParams,
  GetSubDepartmentTasksParams,
  GetIndividualLevelTasksParams,
  GetTasksWithFiltersParams,
  GetAllTasksParams,
  GetMyDelegationsParams,
  GetDelegationsForEmployeeParams,
  GetDelegationsForTaskParams,
  GetDelegationsForSubDepartmentParams,
  GetTaskPresetsParams,
} from "../types";
import { TasksAPI } from "../api";
import { useSyncAttachments } from "./use-sync-attachments";

const api = new TasksAPI(axios);

// ═══════════════════════════════════════════════════════════════════════
// CORE TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

export function useTask(id: string, enabled = true) {
  const query = useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => api.getTask(id),
    enabled: !!id && enabled,
  });
  useSyncAttachments(query.data?.attachments);
  return query;
}

export function useTaskCount(enabled = true) {
  return useQuery({
    queryKey: taskKeys.count(),
    queryFn: api.countTasks,
    enabled,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TASK QUERYING & FILTERING
// ═══════════════════════════════════════════════════════════════════════

export function useMyTasks(params: GetMyTasksParams, enabled = true) {
  const query = useQuery({
    queryKey: taskKeys.myTasks(params),
    queryFn: () => api.getMyTasks(params),
    enabled,
  });
  useSyncAttachments(query.data?.fileHubAttachments);
  return query;
}

export function useTeamTasks(params: GetTeamTasksParams, enabled = true) {
  const query = useQuery({
    queryKey: taskKeys.teamTasks(params),
    queryFn: () => api.getTeamTasks(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useTeamTasksForSupervisor(
  params: GetTeamTasksForSupervisorParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.teamTasksSupervisor(params),
    queryFn: () => api.getTeamTasksForSupervisor(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useDepartmentLevelTasks(
  params: GetDepartmentLevelTasksParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.departmentLevel(params),
    queryFn: () => api.getDepartmentLevelTasks(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useSubDepartmentTasks(
  params: GetSubDepartmentTasksParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.subDepartmentLevel(params),
    queryFn: () => api.getSubDepartmentTasks(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useIndividualLevelTasks(
  params: GetIndividualLevelTasksParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.individualLevel(params),
    queryFn: () => api.getIndividualLevelTasks(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useTasksWithFilters(
  params: GetTasksWithFiltersParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.withFilters(params),
    queryFn: () => api.getTasksWithFilters(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useAllTasks(params: GetAllTasksParams, enabled = true) {
  const query = useQuery({
    queryKey: taskKeys.allTasks(params),
    queryFn: () => api.getAllTasks(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

// ═══════════════════════════════════════════════════════════════════════
// TASK SUBMISSIONS
// ═══════════════════════════════════════════════════════════════════════

export function useTaskSubmission(submissionId: string, enabled = true) {
  const query = useQuery({
    queryKey: taskKeys.submission(submissionId),
    queryFn: () => api.getTaskSubmission(submissionId),
    enabled: !!submissionId && enabled,
  });
  useSyncAttachments(query.data?.attachments);
  return query;
}

export function useTaskSubmissionsByTask(taskId: string, enabled = true) {
  const query = useQuery({
    queryKey: taskKeys.submissionsByTask(taskId),
    queryFn: () => api.getTaskSubmissionsByTask(taskId),
    enabled: !!taskId && enabled,
  });
  useSyncAttachments(query.data?.attachments);
  return query;
}

// ═══════════════════════════════════════════════════════════════════════
// TASK DELEGATIONS
// ═══════════════════════════════════════════════════════════════════════

export function useDelegation(delegationId: string, enabled = true) {
  const query = useQuery({
    queryKey: taskKeys.delegation(delegationId),
    queryFn: () => api.getDelegation(delegationId),
    enabled: !!delegationId && enabled,
  });
  useSyncAttachments(query.data?.attachments);
  return query;
}

export function useMyDelegations(
  params: GetMyDelegationsParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.myDelegations(params),
    queryFn: () => api.getMyDelegations(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useDelegationsForEmployee(
  params: GetDelegationsForEmployeeParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.employeeDelegations(params),
    queryFn: () => api.getDelegationsForEmployee(params),
    enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useDelegationsForTask(
  taskId: string,
  params: GetDelegationsForTaskParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.taskDelegations(taskId, params),
    queryFn: () => api.getDelegationsForTask(taskId, params),
    enabled: !!taskId && enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useDelegationsForSubDepartment(
  subDepartmentId: string,
  params: GetDelegationsForSubDepartmentParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: taskKeys.subDeptDelegations(subDepartmentId, params),
    queryFn: () => api.getDelegationsForSubDepartment(subDepartmentId, params),
    enabled: !!subDepartmentId && enabled,
  });
  useSyncAttachments(query.data?.data.attachments);
  return query;
}

export function useDelegables(search?: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.delegables(search),
    queryFn: () => api.getDelegables({ search }),
    enabled,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TASK PRESETS
// ═══════════════════════════════════════════════════════════════════════

export function useTaskPresets(params: GetTaskPresetsParams, enabled = true) {
  return useQuery({
    queryKey: taskKeys.presetList(params),
    queryFn: () => api.getTaskPresets(params),
    enabled,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TASK VISIBILITY
// ═══════════════════════════════════════════════════════════════════════

export function useTasksVisibility(enabled = true) {
  return useQuery({
    queryKey: taskKeys.tasksVisibility(),
    queryFn: api.getTasksVisibility,
    enabled,
  });
}

export function useTaskVisibility(taskId: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.taskVisibility(taskId),
    queryFn: () => api.getTaskVisibility(taskId),
    enabled: !!taskId && enabled,
  });
}
