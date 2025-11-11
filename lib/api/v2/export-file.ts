import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { JSend } from "./models/jsend";
import type { UUID } from "./models/faq/UUID";

/* ============================================
   Request / Response Contracts (Exports Files)
   ============================================ */

export interface ShareExportRequest {
  exportId: UUID;
  expiresIn?: number;
}

export interface ShareExportResponse {
  shareKey: string;
  expiresAt: string | null;
}

export interface GetSignedExportUrlResponse {
  signedUrl: string;
}

export interface DownloadExportOptions {
  identifier: string; // export UUID or share key
  config?: AxiosRequestConfig;
}

/* ============================================
   Service Singleton
   ============================================ */

export class ExportFileServiceSDK {
  private static instances = new WeakMap<AxiosInstance, ExportFileServiceSDK>();

  private constructor(private readonly http: AxiosInstance) { }

  static getInstance(http: AxiosInstance): ExportFileServiceSDK {
    let inst = ExportFileServiceSDK.instances.get(http);
    if (!inst) {
      inst = new ExportFileServiceSDK(http);
      ExportFileServiceSDK.instances.set(http, inst);
    }
    return inst;
  }

  // POST /exports/files/:exportId/share
  async shareExport(req: ShareExportRequest): Promise<ShareExportResponse> {
    const { exportId, expiresIn } = req;
    const { data } = await this.http.post<JSend<ShareExportResponse>>(
      `/exports/files/${exportId}/share`,
      { expiresIn },
    );
    return data.data;
  }

  // GET /exports/files/:identifier/stream
  async downloadExport({
    identifier,
    config,
  }: DownloadExportOptions): Promise<AxiosResponse<ArrayBuffer>> {
    const response = await this.http.get<ArrayBuffer>(
      `/exports/files/${identifier}/stream`,
      {
        responseType: "arraybuffer",
        ...config,
      },
    );
    return response;
  }

  // GET /exports/files/signed/:identifier
  async getSignedExportUrl(
    identifier: string,
  ): Promise<GetSignedExportUrlResponse> {
    const { data } = await this.http.get<JSend<GetSignedExportUrlResponse>>(
      `/exports/files/signed/${identifier}`,
    );
    return data.data;
  }
}

/* ============================================
   Factory
   ============================================ */

export function createExportFileService(
  http: AxiosInstance,
): ExportFileServiceSDK {
  return ExportFileServiceSDK.getInstance(http);
}