import { create } from "zustand";
import {
  CreateEmployeeDirectRequest,
  RequestEmployeeInvitationRequest,
  EmployeePermissionsEnum,
} from "@/lib/api/v2/services/employee";

export type InvitationType = "direct" | "request";

interface InviteEmployeeModalStore {
  isOpen: boolean;
  invitationType: InvitationType;
  formData: CreateEmployeeDirectRequest | RequestEmployeeInvitationRequest;
  isSubmitting: boolean;
  openModal: (type: InvitationType) => void;
  closeModal: () => void;
  setFormData: (
    data: Partial<
      CreateEmployeeDirectRequest | RequestEmployeeInvitationRequest
    >
  ) => void;
  setIsSubmitting: (submitting: boolean) => void;
  resetForm: () => void;
}

const initialFormData:
  | CreateEmployeeDirectRequest
  | RequestEmployeeInvitationRequest = {
  email: "",
  fullName: "",
  jobTitle: "",
  employeeId: "",
  permissions: [],
  subDepartmentIds: [],
};

export const useInviteEmployeeModalStore = create<InviteEmployeeModalStore>(
  (set) => ({
    isOpen: false,
    invitationType: "direct",
    formData: initialFormData,
    isSubmitting: false,
    openModal: (type) =>
      set({
        isOpen: true,
        invitationType: type,
        formData: initialFormData,
      }),
    closeModal: () =>
      set({
        isOpen: false,
        formData: initialFormData,
      }),
    setFormData: (data) =>
      set((state) => ({
        formData: { ...state.formData, ...data },
      })),
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    resetForm: () => set({ formData: initialFormData }),
  })
);
