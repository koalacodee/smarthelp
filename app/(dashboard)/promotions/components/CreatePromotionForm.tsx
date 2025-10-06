"use client";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import { AudienceType } from "@/lib/api/types";
import { useState } from "react";
import AttachmentInput from "@/components/ui/AttachmentInput";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import useFormErrors from "@/hooks/useFormErrors";

export default function CreatePromotionForm() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "title",
    "audience",
    "startDate",
    "endDate",
  ]);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<AudienceType>(AudienceType.ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const {
    getFormData,
    clearAttachments,
    clearExistingsToDelete,
    setExistingAttachments,
  } = useAttachmentStore();
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      // Get FormData from attachment store
      const formData = attachments.length > 0 ? getFormData() : undefined;

      await api.PromotionService.createPromotion(
        {
          title,
          audience,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        formData
      );

      addToast({
        message: "Promotion Created Successfully",
        type: "success",
      });

      // Clear form and attachment store after successful creation
      setTitle("");
      setAudience(AudienceType.ALL);
      setStartDate("");
      setEndDate("");
      setAttachments([]);
      clearAttachments();
      clearExistingsToDelete();
      setExistingAttachments({});
    } catch (error: any) {
      console.error("Failed to create promotion:", error);
      console.log("Create promotion error:", error);
      console.log("Error response data:", error?.response?.data);

      if (error?.response?.data?.data?.details) {
        console.log(
          "Setting field errors:",
          error?.response?.data?.data?.details
        );
        setErrors(error?.response?.data?.data?.details);
      } else {
        console.log("Setting root error");
        setRootError(
          error?.response?.data?.message ||
            "Failed to create promotion. Please try again."
        );
      }
    }
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      {errors.root && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>{errors.root}</span>
          </div>
        </div>
      )}
      <div>
        <label
          htmlFor="promo-title"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Promotion Title
        </label>
        <input
          id="promo-title"
          placeholder="e.g., Summer Sale"
          className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-700">{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="promo-audience"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Target Audience
        </label>
        <select
          id="promo-audience"
          className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
          required
          value={audience}
          onChange={(e) => setAudience(e.target.value as AudienceType)}
        >
          <option value={AudienceType.ALL}>
            All Users (Customers, Supervisors, Employees)
          </option>
          <option value={AudienceType.CUSTOMER}>Customers Only</option>
          <option value={AudienceType.SUPERVISOR}>Supervisors Only</option>
          <option value={AudienceType.EMPLOYEE}>Employees Only</option>
        </select>
        {errors.audience && (
          <p className="mt-1 text-sm text-red-700">{errors.audience}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="promo-start-date"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Start Date (Optional)
          </label>
          <input
            id="promo-start-date"
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-700">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="promo-end-date"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            End Date (Optional)
          </label>
          <input
            id="promo-end-date"
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-700">{errors.endDate}</p>
          )}
        </div>
        <div>
          <AttachmentInput
            id="promo-attachment"
            accept="image/*,video/*"
            onAttachmentsChange={setAttachments}
            label="Promotion Attachments"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Create Promotion
        </button>
      </div>
    </form>
  );
}
