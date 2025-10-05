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
import { createEmployeeService } from "./services/employee";

export const FAQService = createFAQService(api);
export const UploadService = createUploadService(api);
export const DashboardService = createDashboardService(api);
export const ActivityService = createActivityService(api);
export const EmployeeRequestsService = createEmployeeRequestsService(api);
export const SupervisorService = createSupervisorService(api);
export const SupervisorInvitationService =
  createSupervisorInvitationService(api);
export const ProfilePictureService = createProfilePictureService(api);
export const EmployeeService = createEmployeeService(api);
