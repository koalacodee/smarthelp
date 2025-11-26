// Request/Response interfaces and axios functions for file endpoints

import type { AxiosInstance } from "axios";

export type UUID = string;

/* =========================
   Request/Response Contracts
   ========================= */

// POST /files/single
export interface UploadSingleFileRequest {
  file: File;
  expirationDate?: string; // ISO date string
  uploadKey: string;
}
export interface UploadSingleFileResponse {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
  targetId: string;
  fileType: string;
  sizeInBytes: number;
  contentType: string;
}

export interface AttachmentResponse {
  attachments: Attachment[];
  totalCount: number;
  hasMore: boolean;
}

export interface Attachment {
  id: string;
  type: string; // e.g. "png"
  originalName: string;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
  targetId: string;
  isGlobal: boolean;
  fileType: string; // e.g. "image"
  contentType: string; // e.g. "image/png"
  size: number;
  signedUrl?: string;
}

// POST /files/multiple
export interface UploadMultipleFilesRequest {
  files: File[];
  expirationDates?: string[]; // ISO date strings, optional array
  uploadKey: string;
}
export type UploadMultipleFilesResponse = UploadSingleFileResponse[];

// GET /attachment/:tokenOrId
export interface GetAttachmentRequest {
  tokenOrId: string;
}
export interface GetAttachmentResponse {
  contentType: string;
  originalName: string;
  filePath: string;
}

// GET /attachment/:tokenOrId/metadata
export interface GetAttachmentMetadataRequest {
  tokenOrId: string;
}
export interface GetAttachmentMetadataResponse {
  fileType: string;
  originalName: string;
  sizeInBytes: number;
  expiryDate: string | null;
  contentType: string;
}

// POST /files/share/:attachmentId
export interface ShareAttachmentRequest {
  attachmentId: string;
  expirationDate?: string; // ISO date string, optional
}
export interface ShareAttachmentResponse {
  shareKey: string;
  expiresAt: string; // ISO date string
}

export interface GenerateUploadKeyResponse {
  uploadKey: string;
  message: string;
}

export interface AttachmentSignedUrlResponse {
  signedUrl: string;
}

/* =========================
   Service Singleton
   ========================= */

export class UploadService {
  private static instances = new WeakMap<AxiosInstance, UploadService>();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): UploadService {
    let inst = UploadService.instances.get(http);
    if (!inst) {
      inst = new UploadService(http);
      UploadService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /files/single
  async uploadSingleFile(
    request: UploadSingleFileRequest
  ): Promise<UploadSingleFileResponse> {
    const formData = new FormData();
    formData.append("file", request.file);

    if (request.expirationDate) {
      formData.append("expirationDate", request.expirationDate);
    }

    const { data } = await this.http.post<UploadSingleFileResponse>(
      "/files/single",
      formData,
      {
        headers: {
          "x-upload-key": request.uploadKey,
        },
      }
    );

    return data;
  }

  // POST /files/multiple
  async uploadMultipleFiles(
    request: UploadMultipleFilesRequest
  ): Promise<UploadMultipleFilesResponse> {
    const formData = new FormData();

    // Add all files
    request.files.forEach((file) => {
      formData.append("files", file);
    });

    // Add expiration dates if provided
    if (request.expirationDates) {
      request.expirationDates.forEach((date, index) => {
        formData.append(`expirationDates[${index}]`, date);
      });
    }

    const { data } = await this.http.post<UploadMultipleFilesResponse>(
      "/files/multiple",
      formData,
      {
        headers: {
          "x-upload-key": request.uploadKey,
        },
      }
    );

    return data;
  }

  // GET /attachment/:tokenOrId
  async getAttachment(request: GetAttachmentRequest): Promise<Blob> {
    const { data } = await this.http.get(`/attachment/${request.tokenOrId}`, {
      responseType: "blob",
    });

    return data;
  }

  // GET /attachment/:tokenOrId/metadata
  async getAttachmentMetadata(
    request: GetAttachmentMetadataRequest
  ): Promise<GetAttachmentMetadataResponse> {
    const { data } = await this.http.get<{
      data: GetAttachmentMetadataResponse;
    }>(`/attachment/${request.tokenOrId}/metadata`);
    return data.data;
  }

  // Convenience method to get attachment with metadata
  async getAttachmentWithMetadata(tokenOrId: string): Promise<{
    metadata: GetAttachmentMetadataResponse;
    file: Blob;
  }> {
    const [metadata, file] = await Promise.all([
      this.getAttachmentMetadata({ tokenOrId }),
      this.getAttachment({ tokenOrId }),
    ]);

    return { metadata, file };
  }

  // Convenience method to download attachment as a file
  async downloadAttachment(
    tokenOrId: string,
    filename?: string
  ): Promise<void> {
    const { metadata, file } = await this.getAttachmentWithMetadata(tokenOrId);

    // Create download link
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || metadata.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async uploadFromFormData(formData: FormData, uploadKey: string) {
    if (!uploadKey) {
      return null;
    }
    if (!formData.has("file") && !formData.has("files")) {
      return null;
    }
    if (formData.has("files")) {
      return this.http.post<UploadMultipleFilesResponse>(
        "/files/multiple",
        formData,
        {
          headers: { "x-upload-key": uploadKey },
        }
      );
    } else {
      return this.http.post<UploadSingleFileResponse>(
        "/files/single",
        formData,
        {
          headers: { "x-upload-key": uploadKey },
        }
      );
    }
  }

  async getMyAttachments(): Promise<AttachmentResponse> {
    return this.http
      .get<{ data: AttachmentResponse }>("/files/my-attachments")
      .then((res) => res.data.data);
  }

  async getAttachmentSignedUrl(
    tokenOrId: string
  ): Promise<AttachmentSignedUrlResponse> {
    return this.http
      .get<{ data: AttachmentSignedUrlResponse }>(
        `/attachment/signed/${tokenOrId}`
      )
      .then((res) => res.data.data);
  }

  // POST /files/share/:attachmentId
  async shareAttachment(
    request: ShareAttachmentRequest
  ): Promise<ShareAttachmentResponse> {
    const { data } = await this.http.post<{ data: ShareAttachmentResponse }>(
      `/files/share/${request.attachmentId}`,
      request
    );
    return data.data;
  }

  // POST /files/generate-upload-key
  async generateUploadKey(): Promise<GenerateUploadKeyResponse> {
    const { data } = await this.http.post<{ data: GenerateUploadKeyResponse }>(
      "/files/generate-upload-key",
      {}
    );
    return data.data;
  }

  async deleteAttachment(id: string): Promise<void> {
    await this.http.delete(`/files/${id}`);
  }
}

/* =========================
   Factory
   ========================= */

export function createUploadService(http: AxiosInstance): UploadService {
  return UploadService.getInstance(http);
}
