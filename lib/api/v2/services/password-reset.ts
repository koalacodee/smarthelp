import type { AxiosInstance } from "axios";
import type { JSend } from "../models/jsend";

/* =========================
   Request/Response Contracts
   ========================= */

export interface SendResetPasswordCodeRequest {
  email: string;
}

export interface SendResetPasswordCodeResponse {
  message: string;
}

export interface ResetPasswordRequest {
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
}

/* =========================
   Service Singleton
   ========================= */

export class PasswordResetService {
  private static instances = new WeakMap<AxiosInstance, PasswordResetService>();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): PasswordResetService {
    let inst = PasswordResetService.instances.get(http);
    if (!inst) {
      inst = new PasswordResetService(http);
      PasswordResetService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /auth/forgot-password
  async sendResetPasswordCode(
    body: SendResetPasswordCodeRequest
  ): Promise<SendResetPasswordCodeResponse> {
    const { data } = await this.http.post<JSend<SendResetPasswordCodeResponse>>(
      "/auth/forgot-password",
      body
    );
    return data.data;
  }

  // POST /auth/reset-password
  async resetPassword(
    body: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const { data } = await this.http.post<JSend<ResetPasswordResponse>>(
      "/auth/reset-password",
      body
    );
    return data.data;
  }
}

/* =========================
   Factory
   ========================= */

export function createPasswordResetService(
  http: AxiosInstance
): PasswordResetService {
  return PasswordResetService.getInstance(http);
}
