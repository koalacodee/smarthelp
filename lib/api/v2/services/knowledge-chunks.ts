import type { AxiosInstance } from "axios";

import type { JSend } from "../models/jsend"; // Assuming JSend model exists

/* =========================
   Request/Response Contracts
   ========================= */

export interface CreateKnowledgeChunkInputDto {
  content: string;
  departmentId: string;
}

export interface UpdateKnowledgeChunkInputDto {
  id: string;
  content?: string;
  departmentId?: string;
}

export interface DeleteKnowledgeChunkInputDto {
  id: string;
}

export interface DeleteManyKnowledgeChunksInputDto {
  ids: string[];
}

export type KnowledgeChunk = {
  id: string;
  content: string;
};

export type CreateKnowledgeChunkResponse = {
  knowledgeChunk: KnowledgeChunk;
};

export type UpdateKnowledgeChunkResponse = {
  knowledgeChunk: KnowledgeChunk;
};

export type GetKnowledgeChunkResponse = {
  knowledgeChunk: KnowledgeChunk;
} | null;

export type GetAllKnowledgeChunksResponse = Array<KnowledgeChunk>;

export type GetGroupedKnowledgeChunksResponse = {
  departmentId: string;
  knowledgeChunks: Array<KnowledgeChunk>;
}[];

export type FindKnowledgeChunksByDepartmentResponse = KnowledgeChunk[];

export type DeleteKnowledgeChunkResponse = GetKnowledgeChunkResponse;

export type DeleteManyKnowledgeChunksResponse = KnowledgeChunk[];

export type CountKnowledgeChunksResponse = number;

export interface FindKnowledgeChunksByDepartmentInputDto {
  departmentId: string;
}
/* =========================
   Service Singleton
   ========================= */

export class KnowledgeChunkService {
  private static instances = new WeakMap<
    AxiosInstance,
    KnowledgeChunkService
  >();

  private constructor(private readonly http: AxiosInstance) {}

  static getInstance(http: AxiosInstance): KnowledgeChunkService {
    let inst = KnowledgeChunkService.instances.get(http);
    if (!inst) {
      inst = new KnowledgeChunkService(http);
      KnowledgeChunkService.instances.set(http, inst);
    }
    return inst;
  }

  // POST /knowledge-chunks
  async createKnowledgeChunk(
    body: CreateKnowledgeChunkInputDto
  ): Promise<CreateKnowledgeChunkResponse> {
    const { data } = await this.http.post<JSend<CreateKnowledgeChunkResponse>>(
      "/knowledge-chunks",
      body
    );
    return data.data;
  }

  // PUT /knowledge-chunks
  async updateKnowledgeChunk(
    body: UpdateKnowledgeChunkInputDto
  ): Promise<UpdateKnowledgeChunkResponse> {
    const { data } = await this.http.put<JSend<UpdateKnowledgeChunkResponse>>(
      "/knowledge-chunks",
      body
    );
    return data.data;
  }

  // GET /knowledge-chunks/:id
  async getKnowledgeChunk(id: string): Promise<GetKnowledgeChunkResponse> {
    const { data } = await this.http.get<JSend<GetKnowledgeChunkResponse>>(
      `/knowledge-chunks/${id}`
    );
    return data.data;
  }

  // GET /knowledge-chunks
  async getAllKnowledgeChunks(): Promise<GetAllKnowledgeChunksResponse> {
    const { data } = await this.http.get<JSend<GetAllKnowledgeChunksResponse>>(
      "/knowledge-chunks"
    );
    return data.data;
  }

  // GET /knowledge-chunks/grouped
  async getGroupedKnowledgeChunks(): Promise<GetGroupedKnowledgeChunksResponse> {
    const { data } = await this.http.get<
      JSend<GetGroupedKnowledgeChunksResponse>
    >("/knowledge-chunks/grouped");
    return data.data;
  }

  // GET /knowledge-chunks/by-department
  async findKnowledgeChunksByDepartment(
    params: FindKnowledgeChunksByDepartmentInputDto
  ): Promise<FindKnowledgeChunksByDepartmentResponse> {
    const { data } = await this.http.get<
      JSend<FindKnowledgeChunksByDepartmentResponse>
    >("/knowledge-chunks/by-department", { params });
    return data.data;
  }

  // DELETE /knowledge-chunks/:id
  async deleteKnowledgeChunk(
    id: string
  ): Promise<DeleteKnowledgeChunkResponse> {
    const { data } = await this.http.delete<
      JSend<DeleteKnowledgeChunkResponse>
    >(`/knowledge-chunks/${id}`);
    return data.data ?? null;
  }

  // DELETE /knowledge-chunks/multiple
  async deleteManyKnowledgeChunks(
    body: DeleteManyKnowledgeChunksInputDto
  ): Promise<DeleteManyKnowledgeChunksResponse> {
    const { data } = await this.http.delete<
      JSend<DeleteManyKnowledgeChunksResponse>
    >("/knowledge-chunks/multiple", { data: body });
    return data.data;
  }

  // GET /knowledge-chunks/count
  async countKnowledgeChunks(): Promise<CountKnowledgeChunksResponse> {
    const { data } = await this.http.get<JSend<CountKnowledgeChunksResponse>>(
      "/knowledge-chunks/count"
    );
    return data.data;
  }
}

/* =========================
   Factory
   ========================= */

export function createKnowledgeChunkService(
  http: AxiosInstance
): KnowledgeChunkService {
  return KnowledgeChunkService.getInstance(http);
}
