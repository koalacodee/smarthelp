import type { AttachmentMap } from "./AttachmentMap";

export interface GetGroupedByDepartmentResponse {
  questions: any[];
  attachments: AttachmentMap;
  // {[questionId]: {[attachmentId]: [signedUrl]}}
  fileHubAttachments: Record<string, Record<string, string>>;
}
