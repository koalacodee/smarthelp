import type { AxiosInstance } from "axios";
import type { JSend } from "../models/jsend";

/* =========================
   Request/Response Contracts
   ========================= */

export type UUID = string;

export interface AttachmentMetadata {
  id: UUID;
  type: string;
  filename: string;
  originalName: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  expirationDate?: string;
  targetId?: UUID;
  userId?: UUID;
  guestId?: UUID;
  isGlobal: boolean;
  cloned: boolean;
  fileType: string;
  contentType: string;
  signedUrl?: string;
}

export interface CreateAttachmentGroupRequest {
  attachmentIds: UUID[];
  name: string;
  expiresAt?: Date | string;
}

export interface CreateAttachmentGroupResponse {
  key: string;
}

export interface GetAttachmentGroupByKeyResponse {
  attachments: AttachmentMetadata[];
}

export interface GetAttachmentGroupDetailsResponse {
  id: UUID;
  name: string;
  key: string;
  ips: string[];
  attachments: AttachmentMetadata[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface GetMyAttachmentGroupsRequest {
  limit?: number;
  offset?: number;
}

export interface AttachmentGroupSummary {
  id: UUID;
  name: string;
  key: string;
  clientIds: string[];
  attachments: AttachmentMetadata[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface GetMyAttachmentGroupsResponse {
  attachmentGroups: AttachmentGroupSummary[];
  totalCount: number;
  hasMore: boolean;
}

export interface UpdateAttachmentGroupRequest {
  name?: string;
  attachmentIds?: UUID[];
  expiresAt?: Date | string;
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

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): AttachmentGroupService {
    let inst = AttachmentGroupService.instances.get(http);
    if (!inst) {
      inst = new AttachmentGroupService(http);
      AttachmentGroupService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /filehub/attachment-groups
  async createAttachmentGroup(
    body: CreateAttachmentGroupRequest
  ): Promise<CreateAttachmentGroupResponse> {
    const { data } = await this.http.post<JSend<CreateAttachmentGroupResponse>>(
      "/filehub/attachment-groups",
      body
    );
    return data.data;
  }

  // GET /filehub/attachment-groups/shared/:key
  async getAttachmentGroupByKey(
    key: string
  ): Promise<{ data: GetAttachmentGroupByKeyResponse; cookies?: string[] }> {
    const res = await this.http.get<JSend<GetAttachmentGroupByKeyResponse>>(
      `/filehub/attachment-groups/shared/${key}`
    );

    return { data: res.data.data, cookies: res.headers["set-cookie"] };
  }

  // GET /filehub/attachment-groups/:id
  async getAttachmentGroupDetails(
    id: UUID
  ): Promise<GetAttachmentGroupDetailsResponse> {
    const { data } = await this.http.get<
      JSend<GetAttachmentGroupDetailsResponse>
    >(`/filehub/attachment-groups/${id}`);
    return data.data;
  }

  // GET /filehub/attachment-groups
  async getMyAttachmentGroups(
    params: GetMyAttachmentGroupsRequest = {}
  ): Promise<GetMyAttachmentGroupsResponse> {
    const { data } = await this.http.get<JSend<GetMyAttachmentGroupsResponse>>(
      "/filehub/attachment-groups",
      { params }
    );
    return data.data;
  }

  // PUT /filehub/attachment-groups/:id
  async updateAttachmentGroup(
    id: UUID,
    body: UpdateAttachmentGroupRequest
  ): Promise<UpdateAttachmentGroupResponse> {
    const { data } = await this.http.put<JSend<UpdateAttachmentGroupResponse>>(
      `/filehub/attachment-groups/${id}`,
      body
    );
    return data.data;
  }

  // DELETE /filehub/attachment-groups/:id
  async deleteAttachmentGroup(
    id: UUID
  ): Promise<DeleteAttachmentGroupResponse> {
    const { data } = await this.http.delete<
      JSend<DeleteAttachmentGroupResponse>
    >(`/filehub/attachment-groups/${id}`);
    return data.data;
  }

  // POST /filehub/attachment-groups/close/:key
  async closeAttachmentGroup(
    key: string
  ): Promise<CloseAttachmentGroupResponse> {
    const { data } = await this.http.post<JSend<CloseAttachmentGroupResponse>>(
      `/filehub/attachment-groups/close/${key}`
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
