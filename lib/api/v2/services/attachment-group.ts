import type { AxiosInstance } from "axios";
import type { JSend } from "../models/jsend";

/* =========================
   Types
   ========================= */

export type UUID = string;

export interface Attachment {
  id: UUID;
  type: string;
  filename: string;
  originalName: string;
  expirationDate?: Date;
  userId?: UUID;
  guestId?: UUID;
  isGlobal: boolean;
  size: number;
  fileType?: string;
  contentType?: string;
  createdAt: Date;
  updatedAt: Date;
  targetId?: UUID;
  cloned: boolean;
}

export interface AttachmentGroup {
  id: UUID;
  key: string;
  createdById: UUID;
  ips: string[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

/* =========================
   Request/Response Contracts
   ========================= */

export interface CreateAttachmentGroupRequest {
  attachmentIds: UUID[];
  expiresAt?: Date;
}

export interface CreateAttachmentGroupResponse {
  key: string;
}

export interface GetAttachmentGroupByKeyResponse {
  attachments: Attachment[];
}

export interface GetAttachmentGroupDetailsResponse extends AttachmentGroup { }

export interface GetMyAttachmentGroupsRequest {
  limit?: number;
  offset?: number;
}

export interface GetMyAttachmentGroupsResponse {
  attachmentGroups: AttachmentGroup[];
  totalCount: number;
  hasMore: boolean;
}

export interface UpdateAttachmentGroupRequest {
  attachmentIds: UUID[];
  expiresAt?: Date;
}

export interface UpdateAttachmentGroupResponse {
  success: boolean;
}

export interface DeleteAttachmentGroupResponse {
  success: boolean;
}

export interface CloseAttachmentGroupResponse {
  success: boolean;
}

/* =========================
   Service Singleton
   ========================= */

export class AttachmentGroupService {
  private static instances = new WeakMap<
    AxiosInstance,
    AttachmentGroupService
  >();

  private constructor(private readonly http: AxiosInstance) { }

  static getInstance(http: AxiosInstance): AttachmentGroupService {
    let inst = AttachmentGroupService.instances.get(http);
    if (!inst) {
      inst = new AttachmentGroupService(http);
      AttachmentGroupService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /attachment-groups
  async createAttachmentGroup(
    body: CreateAttachmentGroupRequest
  ): Promise<CreateAttachmentGroupResponse> {
    const { data } = await this.http.post<JSend<CreateAttachmentGroupResponse>>(
      "/attachment-groups",
      body
    );
    return data.data;
  }

  // GET /attachment-groups/shared/:key
  async getAttachmentGroupByKey(
    key: string
  ): Promise<GetAttachmentGroupByKeyResponse> {
    const { data } = await this.http.get<
      JSend<GetAttachmentGroupByKeyResponse>
    >(`/attachment-groups/shared/${key}`);
    return data.data;
  }

  // GET /attachment-groups/:id
  async getAttachmentGroupDetails(
    id: UUID
  ): Promise<GetAttachmentGroupDetailsResponse> {
    const { data } = await this.http.get<
      JSend<GetAttachmentGroupDetailsResponse>
    >(`/attachment-groups/${id}`);
    return data.data;
  }

  // GET /attachment-groups
  async getMyAttachmentGroups(
    params: GetMyAttachmentGroupsRequest = {}
  ): Promise<GetMyAttachmentGroupsResponse> {
    const { data } = await this.http.get<JSend<GetMyAttachmentGroupsResponse>>(
      "/attachment-groups",
      { params }
    );
    return data.data;
  }

  // PUT /attachment-groups/:id
  async updateAttachmentGroup(
    id: UUID,
    body: UpdateAttachmentGroupRequest
  ): Promise<UpdateAttachmentGroupResponse> {
    const { data } = await this.http.put<JSend<UpdateAttachmentGroupResponse>>(
      `/attachment-groups/${id}`,
      body
    );
    return data.data;
  }

  // DELETE /attachment-groups/:id
  async deleteAttachmentGroup(
    id: UUID
  ): Promise<DeleteAttachmentGroupResponse> {
    const { data } = await this.http.delete<
      JSend<DeleteAttachmentGroupResponse>
    >(`/attachment-groups/${id}`);
    return data.data;
  }

  // POST /attachment-groups/close/:attachmentGroupId
  async closeAttachmentGroup(
    key: string
  ): Promise<CloseAttachmentGroupResponse> {
    const { data } = await this.http.post<JSend<CloseAttachmentGroupResponse>>(
      `/attachment-groups/close/${key}`
    );
    return data.data;
  }
}

/* =========================
   Factory
   ========================= */

export function createAttachmentGroupService(
  http: AxiosInstance
): AttachmentGroupService {
  return AttachmentGroupService.getInstance(http);
}
