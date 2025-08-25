export interface LoginDto {
  username: string;
  password: string;
}

export interface AskDto {
  question: string;
  conversationId?: string;
  faqId?: string;
}

export interface PushSubscriptionKeysDto {
  p256dh: string;
  auth: string;
}

export interface CreatePushSubscriptionDto {
  userId: string;
  endpoint: string;
  expirationTime?: string | null;
  keys: PushSubscriptionKeysDto;
}
export interface PushSubscriptionResponseDto {
  id: string;
  userId: string;
  endpoint: string;
  expirationTime: string | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SendToUsersDto {
  userIds: string[];
  notification: SendNotificationDto;
}

export interface SendToGuestsDto {
  guestIds: string[];
  notification: SendNotificationDto;
}

export interface SendToMixedRecipientsDto {
  userIds?: string[];
  guestIds?: string[];
  notification: SendNotificationDto;
}

export interface SendNotificationDto {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  actions?: string[];
}

export interface CreateDepartmentInputDto {
  name: string;
}

export interface DeleteDepartmentInputDto {
  id: string;
}

export interface DeleteManyDepartmentsInputDto {
  ids: string[];
}

export interface UpdateDepartmentInputDto {
  id: string;
  name?: string;
}

export interface CreateKnowledgeChunkInputDto {
  content: string;
  departmentId: string;
}

export interface DeleteKnowledgeChunkInputDto {
  id: string;
}

export interface DeleteManyKnowledgeChunksInputDto {
  ids: string[];
}

export interface FindKnowledgeChunksByDepartmentInputDto {
  departmentId: string;
}

export interface UpdateKnowledgeChunkInputDto {
  id: string;
  content?: string;
  departmentId?: string;
}

export interface CreateQuestionInputDto {
  text: string;
  departmentId: string;
  knowledgeChunkId?: string;
  answer?: string;
}

export interface DeleteManyQuestionsInputDto {
  ids: string[];
}

export interface DeleteQuestionInputDto {
  id: string;
}

export interface UpdateQuestionInputDto {
  text?: string;
  answer?: string;
  departmentId?: string;
  // knowledgeChunkId?: string;
}

export interface ApproveTaskInputDto {
  approverId: string;
}

export interface CreateTaskInputDto {
  title: string;
  description: string;
  departmentId: string;
  assigneeId: string;
  assignerId: string;
  approverId?: string;
  status: string;
  completedAt?: string;
  notes?: string;
  feedback?: string;
}

export interface GetTasksWithFiltersDto {
  assigneeId?: string;
  departmentId?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface RejectTaskInputDto {
  feedback?: string;
}

export interface SubmitTaskForReviewInputDto {
  submittedBy: string; // userId of submitter
  notes?: string;
}

export interface UpdateTaskInputDto {
  id: string;
  title?: string;
  description?: string;
  departmentId?: string;
  assigneeId?: string;
  assignerId?: string;
  approverId?: string | null;
  status?: string;
  completedAt?: string | null;
  notes?: string | null;
  feedback?: string | null;
}

export interface AnswerTicketDto {
  content: string;
}

export interface AnswerTicketResponseDto {
  ticketId: string;
  answerId: string;
  content: string;
  answeredAt: Date;
}

export interface CreateTicketDto {
  departmentId: string;
  question: string;
  guestId?: string;
}

export interface CreateTicketResponseDto {
  ticket: string;
}

export interface TrackTicketDto {
  ticketCode: string;
}

export interface TrackTicketResponseDto {
  id: string;
  code: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  question: string;
  answer?: string;
}

export interface CreateVehicleInputDto {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  status: string; // validated at domain/repo level
  assignedDriverId?: string;
  notes?: string;
  nextMaintenanceDate?: string;
  photos?: string[];
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
}

export interface UpdateVehicleInputDto {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  vin?: string;
  status?: string;
  assignedDriverId?: string;
  notes?: string | null;
  nextMaintenanceDate?: string | null;
}

export interface GetAllLicensesInputDto {
  vehicleId?: string;

  driverId?: string;

  status?: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";

  page?: number;

  limit?: number;
}

export interface GetSingleLicenseInputDto {
  licenseId: string;
}

export interface UpdateLicenseInputDto {
  licenseId: string;

  licenseNumber?: string;

  issueDate?: string;

  expiryDate?: string;

  insurancePolicyNumber?: string;

  insuranceExpiryDate?: string;

  status?: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
}

export interface CreateViolationInputDto {
  driverId: string;

  ruleId: string;

  description: string;

  amount: number;

  vehicleId: string;

  date?: string;

  triggerEventId: string;
}

export interface CreateViolationOutputDto {
  id: string;
  driverId: string;
  vehicleId: string;
  ruleId: string;
  description: string;
  amount: number;
  isPaid: boolean;
  triggerEventId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetViolationsInputDto {
  driverId?: string;

  vehicleId?: string;

  status?: "pending" | "paid";

  page?: number;

  limit?: number;
}

export interface GetViolationsOutputDto {
  data: any[]; // Will map from Violation entity
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ViolationIdDto {
  violationId: string;
}

export interface MarkViolationAsPaidInputDto extends ViolationIdDto {}
export interface MarkViolationAsPendingInputDto extends ViolationIdDto {}

export interface ViolationStatusOutputDto {
  id: string;
  isPaid: boolean;
  updatedAt: string;
}
