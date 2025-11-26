import type { AttachmentMap } from "./AttachmentMap";

export interface FileHubAttachment {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
  targetId: string;
  userId: string;
  isGlobal: boolean;
  size: number;
  cloned: boolean;
  signedUrl: string;
}

export interface GetGroupedByDepartmentResponse {
  questions: any[];
  attachments: AttachmentMap;
  fileHubAttachments: FileHubAttachment[];
}
