import type { AxiosInstance } from "axios";

import type { JSend } from "../models/jsend";

/* =========================
   Request/Response Contracts
   ========================= */

export interface UpdateProfileRequest {
  name?: string;
  username?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
}

export interface SendProfilePasswordResetOTPResponse {
  message: string;
}

export interface VerifyProfilePasswordResetOTPRequest {
  code: string;
  newPassword: string;
}

export interface VerifyProfilePasswordResetOTPResponse {
  success: boolean;
  message: string;
}

/* =========================
   Service Singleton
   ========================= */

export class ProfileService {
  private static instances = new WeakMap<AxiosInstance, ProfileService>;

  private constructor(private readonly http: AxiosInstance) { }

  static getInstance(http: AxiosInstance): ProfileService {
    let inst = ProfileService.instances.get(http);
    if (!inst) {
      inst = new ProfileService(http);
      ProfileService.instances.set(http, inst);
    }
    return inst;
  }

  // PATCH /profile
  async updateProfile(
    body: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    const { data } = await this.http.patch<JSend<UpdateProfileResponse>>(
      "/profile",
      body
    );
    return data.data as UpdateProfileResponse;
  }

  // POST /profile/password/reset/send-otp
  async sendPasswordResetOTP(): Promise<SendProfilePasswordResetOTPResponse> {
    const { data } = await this.http.post<
      JSend<SendProfilePasswordResetOTPResponse>
    >("/profile/password/reset/send-otp");
    return data.data as SendProfilePasswordResetOTPResponse;
  }

  // POST /profile/password/reset/verify-otp
  async verifyPasswordResetOTP(
    body: VerifyProfilePasswordResetOTPRequest
  ): Promise<VerifyProfilePasswordResetOTPResponse> {


    try {
      const { data } = await this.http.post<
        JSend<VerifyProfilePasswordResetOTPResponse>
      >("/profile/password/reset/verify-otp", body);

      return data.data as VerifyProfilePasswordResetOTPResponse;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.data?.details?.[0]?.field === "code") {
        throw new Error("invalid_otp");
      }
      throw error;
    }
  }
}

/* =========================
   Factory
   ========================= */

export function createProfileService(http: AxiosInstance): ProfileService {
  return ProfileService.getInstance(http);
}