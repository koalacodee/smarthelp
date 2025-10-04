// profile-sdk.ts
import type { AxiosInstance } from "axios";

/* ========== JSend Envelope ========== */
export interface JSendSuccess<T> {
  status: "success";
  data: T;
}

/* ========== Shared Types ========== */
export type IsoDateString = string;

/* ========== Profile Picture Entity ========== */
export interface ProfilePicture {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

/* ========== Upload Profile Picture ========== */
export interface UploadProfilePictureRequest {
  file: File;
  uploadKey: string;
}

export interface UploadProfilePictureData {
  profilePicture: ProfilePicture;
  uploadToken: string;
  url: string;
}

/* ========== Generate Upload Key ========== */
export interface GenerateUploadKeyData {
  uploadKey: string;
  expiresAt: IsoDateString;
}

/* ========== Get Profile Picture ========== */
export interface GetProfilePictureData {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
}

/* ========== Services ========== */
export class ProfilePictureService {
  constructor(private readonly http: AxiosInstance) {}

  async generateUploadKey(userId: string): Promise<GenerateUploadKeyData> {
    const res = await this.http.get<JSendSuccess<GenerateUploadKeyData>>(
      `/profile/pictures/upload-key/${userId}`
    );
    return res.data.data;
  }

  async upload(
    request: UploadProfilePictureRequest
  ): Promise<UploadProfilePictureData> {
    const formData = new FormData();
    formData.append("file", request.file);

    const res = await this.http.post<JSendSuccess<UploadProfilePictureData>>(
      "/profile/pictures/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-upload-key": request.uploadKey,
        },
      }
    );
    return res.data.data;
  }

  async getProfilePicture(tokenOrId: string): Promise<Blob> {
    const res = await this.http.get(`/profile/pictures/${tokenOrId}`, {
      responseType: "blob",
    });
    return res.data;
  }

  getProfilePictureUrl(id: string): string {
    return `${this.http.defaults.baseURL}/profile/pictures/${id}`;
  }

  getProfilePictureUrlByToken(token: string): string {
    return `${this.http.defaults.baseURL}/profile/pictures/${token}`;
  }
}

/* ========== Factories ========== */
export interface ProfileServices {
  profilePicture: ProfilePictureService;
}

export function createProfileServices(http: AxiosInstance): ProfileServices {
  return {
    profilePicture: new ProfilePictureService(http),
  };
}

export const createProfilePictureService = (http: AxiosInstance) =>
  new ProfilePictureService(http);
