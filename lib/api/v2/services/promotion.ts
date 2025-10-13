import type { AxiosInstance } from "axios";
import type { JSend } from "../models/jsend";

export type UUID = string;

export interface PromotionDTO {
  id: UUID;
  title: string;
  attach?: boolean;
  audience?: AudienceType;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum AudienceType {
  ALL = "ALL",
  SUPERVISOR = "SUPERVISOR",
  EMPLOYEE = "EMPLOYEE",
  CUSTOMER = "CUSTOMER",
}

export interface CreatePromotionRequest {
  title: string;
  attach?: boolean;
  audience?: AudienceType;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  chooseAttachments?: UUID[];
}
export type CreatePromotionResponse = {
  promotion: PromotionDTO;
  uploadKey?: string;
};

export interface UpdatePromotionRequest {
  title?: string;
  attach?: boolean;
  audience?: AudienceType;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  deleteAttachments?: UUID[];
  chooseAttachments?: UUID[];
}
export type UpdatePromotionResponse = {
  promotion: PromotionDTO;
  uploadKey?: string;
};

export type GetPromotionResponse = {
  promotion: PromotionDTO;
  attachments: { [key: string]: string[] };
};
export type GetAllPromotionsResponse = {
  promotions: PromotionDTO[];
  attachments: { [key: string]: string[] };
};

export type TogglePromotionActiveResponse = PromotionDTO;
export type DeletePromotionResponse = null | { id: UUID };

/* =========================
   Service Singleton
   ========================= */

export class PromotionService {
  private static instances = new WeakMap<AxiosInstance, PromotionService>();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): PromotionService {
    let inst = PromotionService.instances.get(http);
    if (!inst) {
      inst = new PromotionService(http);
      PromotionService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /promotions
  async createPromotion(
    body: CreatePromotionRequest
  ): Promise<CreatePromotionResponse> {
    const { data } = await this.http.post<JSend<CreatePromotionResponse>>(
      "/promotions",
      body
    );
    return data.data;
  }

  // PUT /promotions  (controller expects { id, ...fields } in body)
  async updatePromotion(
    id: UUID,
    body: UpdatePromotionRequest
  ): Promise<UpdatePromotionResponse> {
    const { data } = await this.http.put<JSend<UpdatePromotionResponse>>(
      "/promotions",
      { id, ...body }
    );
    return data.data;
  }

  // GET /promotions
  async getAllPromotions(): Promise<GetAllPromotionsResponse> {
    const { data } = await this.http.get<JSend<GetAllPromotionsResponse>>(
      "/promotions"
    );
    return data.data;
  }

  // GET /promotions/:id
  async getPromotion(id: UUID): Promise<GetPromotionResponse> {
    const { data } = await this.http.get<JSend<GetPromotionResponse>>(
      `/promotions/${id}`
    );
    return data.data;
  }

  // GET /promotions/user (requires user auth)
  async getPromotionForUser(): Promise<PromotionDTO | null> {
    const { data } = await this.http.get<JSend<PromotionDTO | null>>(
      "/promotions/user"
    );
    return data.data ?? null;
  }

  // GET /promotions/customer (uses GuestIdInterceptor)
  async getPromotionForCustomer(): Promise<PromotionDTO | null> {
    const { data } = await this.http.get<JSend<PromotionDTO | null>>(
      "/promotions/customer"
    );
    return data.data ?? null;
  }

  // POST /promotions/:id/toggle-active
  async togglePromotionActive(
    id: UUID
  ): Promise<TogglePromotionActiveResponse> {
    const { data } = await this.http.post<JSend<TogglePromotionActiveResponse>>(
      `/promotions/${id}/toggle-active`
    );
    return data.data;
  }

  // DELETE /promotions/:id
  async deletePromotion(id: UUID): Promise<DeletePromotionResponse> {
    const { data } = await this.http.delete<JSend<DeletePromotionResponse>>(
      `/promotions/${id}`
    );
    return data.data ?? null;
  }
}

/* =========================
   Factory
   ========================= */

export function createPromotionService(http: AxiosInstance): PromotionService {
  return PromotionService.getInstance(http);
}
