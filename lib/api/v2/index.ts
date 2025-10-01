import { createFAQService } from "./services/faq";
import api from "./axios";
import { createUploadService } from "./services/shared/upload";

export const FAQService = createFAQService(api);
export const UploadService = createUploadService(api);
