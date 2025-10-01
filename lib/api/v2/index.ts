import { createFAQService } from "./services/faq";
import api from "./axios";
import { createUploadService } from "./services/shared/upload";
import {
  createActivityService,
  createDashboardService,
  createEmployeeRequestsService,
} from "./services/dashboard";

export const FAQService = createFAQService(api);
export const UploadService = createUploadService(api);
export const DashboardService = createDashboardService(api);
export const ActivityService = createActivityService(api);
export const EmployeeRequestsService = createEmployeeRequestsService(api);
