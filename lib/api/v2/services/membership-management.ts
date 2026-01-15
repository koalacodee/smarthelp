import type { AxiosInstance } from "axios";
import type { JSend } from "../models/jsend";
import { io } from "socket.io-client";

/* =========================
   Request/Response Contracts
   ========================= */

export type UUID = string;

export interface AddMemberRequest {
  otp: string;
  name: string;
  attachmentGroupId: UUID;
}

export interface MemberDetails {
  id: UUID;
  name: string;
  memberId: UUID;
  attachmentGroupId: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddMemberResponse {
  success: boolean;
  member: MemberDetails;
}

export interface GetAllMembersRequest {
  limit?: number;
  offset?: number;
}

export interface MemberWithGroupDetails {
  id: UUID;
  memberId: UUID;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  attachmentGroup: {
    id: UUID;
    key: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: UUID;
  };
}

export interface GetAllMembersResponse {
  members: MemberWithGroupDetails[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface UpdateMemberRequest {
  name?: string;
  attachmentGroupId?: UUID;
}

export interface UpdateMemberResponse {
  member: MemberDetails;
}

export interface DeleteMemberResponse {
  success: boolean;
  deletedMember: MemberDetails;
}

/* =========================
   Service Singleton
   ========================= */

export class AttachmentGroupMemberManagementService {
  private static instances = new WeakMap<
    AxiosInstance,
    AttachmentGroupMemberManagementService
  >();

  private constructor(
    private readonly http: AxiosInstance,
    private readonly wsBaseUrl: string
  ) {}

  static getInstance(
    http: AxiosInstance,
    wsBaseUrl: string
  ): AttachmentGroupMemberManagementService {
    let inst = AttachmentGroupMemberManagementService.instances.get(http);
    if (!inst) {
      inst = new AttachmentGroupMemberManagementService(http, wsBaseUrl);
      AttachmentGroupMemberManagementService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /filehub/attachment-groups/members
  async addMember(body: AddMemberRequest): Promise<AddMemberResponse> {
    const { data } = await this.http.post<JSend<AddMemberResponse>>(
      "/filehub/attachment-groups/members",
      body
    );
    return data.data;
  }

  // GET /filehub/attachment-groups/members/all
  async getAllMembersWithGroups(
    params: GetAllMembersRequest = {}
  ): Promise<GetAllMembersResponse> {
    const { data } = await this.http.get<JSend<GetAllMembersResponse>>(
      "/filehub/attachment-groups/members/all",
      { params }
    );
    return data.data;
  }

  // PUT /filehub/attachment-groups/members/:memberId
  async updateMember(
    memberId: UUID,
    body: UpdateMemberRequest
  ): Promise<UpdateMemberResponse> {
    const { data } = await this.http.put<JSend<UpdateMemberResponse>>(
      `/filehub/attachment-groups/members/${memberId}`,
      body
    );
    return data.data;
  }

  // DELETE /filehub/attachment-groups/members/:memberId
  async deleteMember(memberId: UUID): Promise<DeleteMemberResponse> {
    const { data } = await this.http.delete<JSend<DeleteMemberResponse>>(
      `/filehub/attachment-groups/members/${memberId}`
    );
    return data.data;
  }

  async subscribeOnActiveMembers(
    accessToken: string,
    onActiveMembersUpdate: (members: string[]) => void
  ) {
    const socket = io(`${this.wsBaseUrl}/filehub/members`, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: {
        token: accessToken,
      },
    });

    socket.emit("active_members_sub");

    socket.on("active_members_update", (data: { members: string[] }) => {
      onActiveMembersUpdate(data.members);
    });

    return () => {
      socket.off("active_members_update");
      socket.disconnect();
    };
  }
}

/* =========================
   Factory
   ========================= */

export function createAttachmentGroupMemberManagementService(
  http: AxiosInstance,
  wsBaseUrl: string
): AttachmentGroupMemberManagementService {
  return AttachmentGroupMemberManagementService.getInstance(http, wsBaseUrl);
}
