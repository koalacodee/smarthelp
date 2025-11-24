"use client";

import { create } from "zustand";
import { TusService } from "@/lib/api/v2/services/shared/tus";

const DEFAULT_TUS_ENDPOINT =
  process.env.NEXT_PUBLIC_TUS_UPLOAD_URL ||
  `${process.env.NEXT_PUBLIC_API_URL ?? ""}/filehub/uploads`;

export type FileUploadStatus = "queued" | "uploading" | "uploaded" | "error";

export interface AttachmentUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: FileUploadStatus;
  error?: string;
  uploadedAt?: string;
  expiration?: string | null;
  isGlobal?: boolean;
}

interface AttachmentUploadState {
  files: Record<string, AttachmentUploadItem>;
  order: string[];
  uploadEndpoint: string;
  chunkSize: number;
  fileHubUploadKey?: string;
  isUploading: boolean;
  addFiles: (
    files: File[] | FileList,
    metadata?: { expiration?: string | null; isGlobal?: boolean }
  ) => void;
  removeFile: (id: string) => void;
  clearAll: () => void;
  setUploadEndpoint: (endpoint: string) => void;
  setChunkSize: (size: number) => void;
  setFileHubUploadKey: (key?: string) => void;
  uploadFile: (id: string) => Promise<void>;
  uploadAll: () => Promise<void>;
}

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useAttachmentUploadStore = create<AttachmentUploadState>(
  (set, get) => ({
    files: {},
    order: [],
    uploadEndpoint: DEFAULT_TUS_ENDPOINT,
    chunkSize: 1024 * 1024,
    fileHubUploadKey: undefined,
    isUploading: false,

    addFiles: (incoming, metadata) => {
      const files = Array.from(incoming ?? []);
      if (!files.length) return;

      const newEntries: Record<string, AttachmentUploadItem> = {};
      const ids: string[] = [];

      files.forEach((file) => {
        const id = createId();
        const previewUrl = URL.createObjectURL(file);
        newEntries[id] = {
          id,
          file,
          previewUrl,
          progress: 0,
          status: "queued",
          expiration: metadata?.expiration ?? null,
          isGlobal: metadata?.isGlobal ?? false,
        };
        ids.push(id);
      });

      set((state) => ({
        files: { ...state.files, ...newEntries },
        order: [...state.order, ...ids],
      }));
    },

    removeFile: (id) => {
      set((state) => {
        const file = state.files[id];
        if (file?.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }

        const { [id]: _, ...rest } = state.files;
        return {
          ...state,
          files: rest,
          order: state.order.filter((fileId) => fileId !== id),
        };
      });
    },

    clearAll: () => {
      set((state) => {
        state.order.forEach((id) => {
          const file = state.files[id];
          if (file?.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
        return {
          ...state,
          files: {},
          order: [],
        };
      });
    },

    setUploadEndpoint: (endpoint) => {
      if (!endpoint) return;
      set({ uploadEndpoint: endpoint });
    },

    setChunkSize: (size) => {
      if (size <= 0) return;
      set({ chunkSize: size });
    },

    setFileHubUploadKey: (key) => {
      set({ fileHubUploadKey: key });
    },

    uploadFile: async (id) => {
      const state = get();
      const fileEntry = state.files[id];
      if (!fileEntry) return;

      if (!state.fileHubUploadKey) {
        throw new Error("filehub_upload_key_missing");
      }

      const tusService = new TusService(state.uploadEndpoint);

      set((current) => ({
        ...current,
        files: {
          ...current.files,
          [id]: {
            ...current.files[id],
            status: "uploading",
            progress: 0,
            error: undefined,
          },
        },
      }));

      await new Promise<void>(async (resolve, reject) => {
        const upload = await tusService.upload({
          file: fileEntry.file,
          uploadKey: state.fileHubUploadKey!,
          metadata: {
            expiration: fileEntry.expiration ?? "",
            isGlobal: fileEntry.isGlobal ? "1" : "0",
          },
          onProgress: (uploaded, total) => {
            const percent = total ? Math.round((uploaded / total) * 100) : 0;
            set((current) => {
              const target = current.files[id];
              if (!target) return current;
              return {
                ...current,
                files: {
                  ...current.files,
                  [id]: {
                    ...target,
                    progress: percent,
                  },
                },
              };
            });
          },
          onError: (err) => {
            set((current) => {
              const target = current.files[id];
              if (!target) return current;
              return {
                ...current,
                files: {
                  ...current.files,
                  [id]: {
                    ...target,
                    status: "error",
                    error: err?.message || "Upload failed",
                  },
                },
              };
            });
            reject(err);
          },
          onSuccess: () => {
            set((current) => {
              const target = current.files[id];
              if (!target) return current;
              return {
                ...current,
                files: {
                  ...current.files,
                  [id]: {
                    ...target,
                    status: "uploaded",
                    progress: 100,
                    uploadedAt: new Date().toISOString(),
                  },
                },
              };
            });
            resolve();
          },
        });

        upload.start();
      });
    },

    uploadAll: async () => {
      const { order } = get();
      if (!order.length) return;

      set({ isUploading: true });
      try {
        for (const id of order) {
          const file = get().files[id];
          if (!file || file.status === "uploaded") continue;
          await get().uploadFile(id);
        }
      } finally {
        set({ isUploading: false });
      }
    },
  })
);
