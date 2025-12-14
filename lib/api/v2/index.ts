import { createFAQService } from "./services/faq";
import api from "./axios";
import { createUploadService } from "./services/shared/upload";
import {
  createActivityService,
  createDashboardService,
  createEmployeeRequestsService,
} from "./services/dashboard";
import {
  createSupervisorInvitationService,
  createSupervisorService,
} from "./services/supervisor";
import { createProfilePictureService } from "./services/profile";
import { createProfileService } from "./services/profile-info";
import { createEmployeeService } from "./services/employee";
import { createPromotionService } from "./services/promotion";
import { createTaskService } from "./services/task";
import { createAttachmentGroupService } from "./services/attachment-group";
import { createPasswordResetService } from "./services/password-reset";
import { createEmployeeDashboardService } from "./services/employee-dash";
import { createExportFileService } from "./export-file";
import { createTaskDelegationService } from "./services/delegations";
import {
  createFileHubService,
  createFilHubProfilePictureService,
} from "./services/shared/filehub";
import { createAttachmentGroupService as createFileHubAttachmentGroupService } from "./services/filehub-attachment-groups";
import { createAttachmentGroupMemberSDK } from "./services/membership";
import { createAttachmentGroupMemberManagementService } from "./services/membership-management";
import { env } from "next-runtime-env";
import { createKnowledgeChunkService } from "./services/knowledge-chunks";

export const FAQService = createFAQService(api);
export const UploadService = createUploadService(api);
export const DashboardService = createDashboardService(api);
export const ActivityService = createActivityService(api);
export const EmployeeRequestsService = createEmployeeRequestsService(api);
export const SupervisorService = createSupervisorService(api);
export const SupervisorInvitationService =
  createSupervisorInvitationService(api);
export const ProfilePictureService = createProfilePictureService(api);
export const ProfileService = createProfileService(api);
export const EmployeeService = createEmployeeService(api);
export const PromotionService = createPromotionService(api);
export const TaskService = createTaskService(api);
export const AttachmentGroupService = createAttachmentGroupService(api);
export const PasswordResetService = createPasswordResetService(api);
export const EmployeeDashboardService = createEmployeeDashboardService(api);
export const ExportFileService = createExportFileService(api);
export const TaskDelegationService = createTaskDelegationService(api);
export const FileHubService = createFileHubService(api);
export const FileHubAttachmentGroupService =
  createFileHubAttachmentGroupService(api);
export const FileHubProfilePictureService =
  createFilHubProfilePictureService(api);
export const MembershipService = createAttachmentGroupMemberSDK({
  apiBaseUrl: api.defaults.baseURL!,
  wsBaseUrl: env("NEXT_PUBLIC_BASE_SOCKET_IO_URL"),
});
export const MemberManagementService =
  createAttachmentGroupMemberManagementService(
    api,
    env("NEXT_PUBLIC_BASE_SOCKET_IO_URL")!
  );
export const KnowledgeChunkService = createKnowledgeChunkService(api);
