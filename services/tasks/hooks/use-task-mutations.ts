import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "../keys";
import axios from "../axios";
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  ExportTasksRequest,
  SubmitTaskForReviewRequest,
  SubmitTaskSubmissionRequest,
  ApproveTaskRequest,
  ApproveTaskSubmissionRequest,
  RejectTaskRequest,
  RejectTaskSubmissionRequest,
  DelegateTaskRequest,
  UpdateDelegationRequest,
  ApproveTaskDelegationRequest,
  RejectTaskDelegationSubmissionRequest,
  SaveTaskPresetRequest,
} from "../types";
import { TasksAPI } from "../api";
import { useTaskStore } from "../store";
import {
  addTasksToCache,
  updateTaskInCache,
  removeTaskFromCache,
  updateCountCache,
} from "../cache-utils";

const api = new TasksAPI(axios);

// ═══════════════════════════════════════════════════════════════════════
// CORE TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

export function useCreateTask() {
  const qc = useQueryClient();
  const setFileHubUploadKey = useTaskStore((s) => s.setFileHubUploadKey);
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => api.createTask(data),
    onSuccess: (response) => {
      addTasksToCache(qc, response.task);
      updateCountCache(qc, +1);
      if (response.fileHubUploadKey) {
        setFileHubUploadKey(response.fileHubUploadKey);
      }
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const setFileHubUploadKey = useTaskStore((s) => s.setFileHubUploadKey);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      api.updateTask(id, data),
    onSuccess: (response) => {
      updateTaskInCache(qc, response.task);
      if (response.fileHubUploadKey) {
        setFileHubUploadKey(response.fileHubUploadKey);
      }
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: (deletedTask) => {
      removeTaskFromCache(qc, deletedTask.id);
      updateCountCache(qc, -1);
    },
  });
}

export function useRestartTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.restartTask(id),
    onSuccess: (updatedTask) => {
      updateTaskInCache(qc, updatedTask);
    },
  });
}

export function useExportTasks() {
  return useMutation({
    mutationFn: (data: ExportTasksRequest) => api.exportTasks(data),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TASK SUBMISSION & REVIEW
// ═══════════════════════════════════════════════════════════════════════

export function useSubmitTaskForReview() {
  const qc = useQueryClient();
  const setFileHubUploadKey = useTaskStore((s) => s.setFileHubUploadKey);
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: SubmitTaskForReviewRequest;
    }) => api.submitTaskForReview(taskId, data),
    onSuccess: (response, { taskId }) => {
      // Response has submission, not the full task — invalidate to refresh
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.submissionsByTask(taskId) });
      if (response.fileHubUploadKey) {
        setFileHubUploadKey(response.fileHubUploadKey);
      }
    },
  });
}

export function useApproveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: ApproveTaskRequest;
    }) => api.approveTask(taskId, data),
    onSuccess: (_data, { taskId }) => {
      // Returns void — must invalidate to get fresh state
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useRejectTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: RejectTaskRequest;
    }) => api.rejectTask(taskId, data),
    onSuccess: (updatedTask) => {
      updateTaskInCache(qc, updatedTask);
    },
  });
}

export function useMarkTaskSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => api.markTaskSeen(taskId),
    onSuccess: (response) => {
      updateTaskInCache(qc, response.task);
    },
  });
}

export function useSubmitTaskSubmission() {
  const qc = useQueryClient();
  const setFileHubUploadKey = useTaskStore((s) => s.setFileHubUploadKey);
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: SubmitTaskSubmissionRequest;
    }) => api.submitTaskSubmission(taskId, data),
    onSuccess: (response, { taskId }) => {
      // Response has submission, not the full task — invalidate to refresh
      qc.invalidateQueries({ queryKey: taskKeys.submissionsByTask(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      if (response.fileHubUploadKey) {
        setFileHubUploadKey(response.fileHubUploadKey);
      }
    },
  });
}

export function useApproveTaskSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: ApproveTaskSubmissionRequest;
    }) => api.approveTaskSubmission(submissionId, data),
    onSuccess: () => {
      // Submission approval can change task status — broad invalidation needed
      qc.invalidateQueries({ queryKey: taskKeys.submissions() });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useRejectTaskSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: RejectTaskSubmissionRequest;
    }) => api.rejectTaskSubmission(submissionId, data),
    onSuccess: () => {
      // Submission rejection can change task status — broad invalidation needed
      qc.invalidateQueries({ queryKey: taskKeys.submissions() });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TASK DELEGATION
// ═══════════════════════════════════════════════════════════════════════

export function useDelegateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DelegateTaskRequest) => api.delegateTask(data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: taskKeys.delegations() });
      qc.invalidateQueries({ queryKey: taskKeys.detail(vars.taskId) });
    },
  });
}

export function useUpdateDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      delegationId,
      data,
    }: {
      delegationId: string;
      data: UpdateDelegationRequest;
    }) => api.updateDelegation(delegationId, data),
    onSuccess: (_data, { delegationId }) => {
      qc.invalidateQueries({
        queryKey: taskKeys.delegation(delegationId),
      });
      qc.invalidateQueries({ queryKey: taskKeys.delegations() });
    },
  });
}

export function useDeleteDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (delegationId: string) => api.deleteDelegation(delegationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.delegations() });
    },
  });
}

export function useMarkDelegationSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (delegationId: string) => api.markDelegationSeen(delegationId),
    onSuccess: (_data, delegationId) => {
      qc.invalidateQueries({
        queryKey: taskKeys.delegation(delegationId),
      });
      qc.invalidateQueries({ queryKey: taskKeys.delegations() });
    },
  });
}

export function useApproveDelegationSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: ApproveTaskDelegationRequest;
    }) => api.approveDelegationSubmission(submissionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.delegations() });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useRejectDelegationSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: RejectTaskDelegationSubmissionRequest;
    }) => api.rejectDelegationSubmission(submissionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.delegations() });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useForwardDelegationSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) =>
      api.forwardDelegationSubmission(submissionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.delegations() });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TASK PRESETS
// ═══════════════════════════════════════════════════════════════════════

export function useSaveTaskPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveTaskPresetRequest) => api.saveTaskPreset(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.presets() });
    },
  });
}

export function useDeleteTaskPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (presetId: string) => api.deleteTaskPreset(presetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.presets() });
    },
  });
}
