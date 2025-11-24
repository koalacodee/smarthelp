import { create } from "zustand";

interface FileHubAttachmentsState {
  fileHubAttachments: Record<string, Record<string, string>>; // {questionId: {attachmentId: signedUrl}}
  setFileHubAttachments: (
    attachments: Record<string, Record<string, string>>
  ) => void;
  getFileHubAttachmentsForQuestion: (
    questionId: string
  ) => Record<string, string>;
}

export const useFileHubAttachmentsStore = create<FileHubAttachmentsState>(
  (set, get) => ({
    fileHubAttachments: {},

    setFileHubAttachments: (attachments) => {
      set({ fileHubAttachments: attachments });
    },

    getFileHubAttachmentsForQuestion: (questionId) => {
      const state = get();
      return state.fileHubAttachments[questionId] || {};
    },
  })
);
