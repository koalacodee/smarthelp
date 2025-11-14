"use client";

import { create } from "zustand";
import { TaskSubmission, TaskSubmissionsResponse } from "@/lib/api";
import { TaskDelegationSubmissionDTO } from "@/lib/api/v2/services/delegations";

interface TaskSubmissionsState {
  taskSubmissions: Record<string, TaskSubmission[]>;
  delegationSubmissions: Record<string, TaskDelegationSubmissionDTO[]>;
  submissionAttachments: Record<string, string[]>; // submissionId -> attachmentIds[]
  setTaskSubmissions: (taskId: string, submissions: TaskSubmission[]) => void;
  setAllTaskSubmissions: (
    submissions: Record<string, TaskSubmission[]>
  ) => void;
  setDelegationSubmissions: (taskId: string, submissions: TaskDelegationSubmissionDTO[]) => void;
  setAllDelegationSubmissions: (
    submissions: Record<string, TaskDelegationSubmissionDTO[]>
  ) => void;
  setSubmissionAttachments: (
    submissionId: string,
    attachments: string[]
  ) => void;
  setAllSubmissionAttachments: (attachments: Record<string, string[]>) => void;
  getTaskSubmissions: (taskId: string) => TaskSubmission[];
  getDelegationSubmissions: (taskId: string) => TaskDelegationSubmissionDTO[];
  getSubmissionAttachments: (submissionId: string) => string[];
  clearTaskSubmissions: () => void;
}

export const useTaskSubmissionsStore = create<TaskSubmissionsState>(
  (set, get) => ({
    taskSubmissions: {},
    delegationSubmissions: {},
    submissionAttachments: {},

    setTaskSubmissions: (taskId: string, submissions: TaskSubmission[]) =>
      set((state) => ({
        taskSubmissions: {
          ...state.taskSubmissions,
          [taskId]: submissions,
        },
      })),

    setAllTaskSubmissions: (submissions: Record<string, TaskSubmission[]>) =>
      set({ taskSubmissions: submissions }),

    setDelegationSubmissions: (taskId: string, submissions: TaskDelegationSubmissionDTO[]) =>
      set((state) => ({
        delegationSubmissions: {
          ...state.delegationSubmissions,
          [taskId]: submissions,
        },
      })),

    setAllDelegationSubmissions: (submissions: Record<string, TaskDelegationSubmissionDTO[]>) =>
      set({ delegationSubmissions: submissions }),

    setSubmissionAttachments: (submissionId: string, attachments: string[]) =>
      set((state) => ({
        submissionAttachments: {
          ...state.submissionAttachments,
          [submissionId]: attachments,
        },
      })),

    setAllSubmissionAttachments: (attachments: Record<string, string[]>) =>
      set({ submissionAttachments: attachments }),

    getTaskSubmissions: (taskId: string) => {
      const state = get();
      return state.taskSubmissions[taskId] || [];
    },

    getDelegationSubmissions: (taskId: string) => {
      const state = get();
      return state.delegationSubmissions[taskId] || [];
    },

    getSubmissionAttachments: (submissionId: string) => {
      const state = get();
      return state.submissionAttachments[submissionId] || [];
    },

    clearTaskSubmissions: () =>
      set({ taskSubmissions: {}, delegationSubmissions: {}, submissionAttachments: {} }),
  })
);
