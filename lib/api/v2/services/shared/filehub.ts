// Request/Response interfaces and axios functions for file endpoints

import type { AxiosInstance } from "axios";
import { JSend } from "../../models/jsend";
import qs from "qs";
export type UUID = string;

/* =========================
   Request/Response Contracts
   ========================= */

export interface FileHubAttachment {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
  targetId: string | null;
  userId?: string;
  guestId?: string;
  isGlobal: boolean;
  size: number;
  cloned?: boolean;
  signedUrl?: string;
}

export interface GenerateUserUploadTokenOutput {
  uploadKey: string;
  uploadExpiry: string; // ISO date string
}

export type MyFileHubAttachmentsResponse = JSend<FileHubAttachment[]>;

/* =========================
   Service Singleton
   ========================= */

export class FileHubService {
  private static instances = new WeakMap<AxiosInstance, FileHubService>();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): FileHubService {
    let inst = FileHubService.instances.get(http);
    if (!inst) {
      inst = new FileHubService(http);
      FileHubService.instances.set(http, inst);
    }
    return inst;
  }

  async getMyAttachments(): Promise<FileHubAttachment[]> {
    const { data } = await this.http.get<MyFileHubAttachmentsResponse>(
      "/filehub/my-attachments"
    );
    return data.data;
  }

  async generateUploadKey(): Promise<GenerateUserUploadTokenOutput> {
    const { data } = await this.http.post<JSend<GenerateUserUploadTokenOutput>>(
      "/filehub/upload-token"
    );
    return data.data;
  }

  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    await this.http.delete("/filehub/my-attachments", {
      params: {
        attachmentIds: attachmentIds.length > 1 ? attachmentIds : undefined,
        singleAttachmentId:
          attachmentIds.length === 1 ? attachmentIds[0] : undefined,
      },
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
    });
  }
}

/* =========================
   Request/Response Contracts
   ========================= */

export interface GenerateProfilePictureUploadUrlRequest {
  fileExtension: "avif" | "webp" | "png" | "jpeg" | "jpg";
}

export interface GenerateProfilePictureUploadUrlResponse {
  signedUrl: string;
  expirationDate: string;
}

export interface GetMyProfilePictureResponse {
  signedUrl: string;
  expirationDate: string;
}

/* =========================
   Service Singleton
   ========================= */

export class FileHubProfilePictureService {
  private static instances = new WeakMap<
    AxiosInstance,
    FileHubProfilePictureService
  >();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): FileHubProfilePictureService {
    let inst = FileHubProfilePictureService.instances.get(http);
    if (!inst) {
      inst = new FileHubProfilePictureService(http);
      FileHubProfilePictureService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /filehub/profile-pictures/upload-url
  async generateUploadUrl(
    body: GenerateProfilePictureUploadUrlRequest
  ): Promise<GenerateProfilePictureUploadUrlResponse> {
    const { data } = await this.http.post<
      JSend<GenerateProfilePictureUploadUrlResponse>
    >("/filehub/profile-pictures/upload-url", body);
    return data.data;
  }

  // GET /filehub/profile-pictures/my-picture
  async getMyProfilePicture(): Promise<GetMyProfilePictureResponse> {
    const { data } = await this.http.get<JSend<GetMyProfilePictureResponse>>(
      "/filehub/profile-pictures/my-picture"
    );
    return data.data;
  }
}

/* =========================
   Factory
   ========================= */

export function createFilHubProfilePictureService(
  http: AxiosInstance
): FileHubProfilePictureService {
  return FileHubProfilePictureService.getInstance(http);
}

/* =========================
   Factory
   ========================= */

export function createFileHubService(http: AxiosInstance): FileHubService {
  return FileHubService.getInstance(http);
}
