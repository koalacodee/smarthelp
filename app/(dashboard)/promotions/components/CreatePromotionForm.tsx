"use client";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import { AudienceType } from "@/lib/api/types";
import { useState, useEffect } from "react";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import { useAttachments } from "@/hooks/useAttachments";
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
  const [uploadKeyV3, setUploadKeyV3] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isWaitingToClear, setIsWaitingToClear] = useState(false);
  const [hasStartedUpload, setHasStartedUpload] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [hasFilesToUpload, setHasFilesToUpload] = useState(false);
  const { moveCurrentNewTargetSelectionsToExisting, reset } = useAttachments();
  const addToast = useToastStore((state) => state.addToast);

  const handleSelectedAttachmentsChange = (attachmentIds: Set<string>) => {
    setSelectedAttachments(Array.from(attachmentIds));
  };

  const clearForm = () => {
    setTitle("");
    setAudience(AudienceType.ALL);
    setStartDate("");
    setEndDate("");
    setSelectedAttachments([]);
    setHasFilesToUpload(false);
    setIsWaitingToClear(false);
    setHasStartedUpload(false);
    setUploadKeyV3(null);
    reset();
  };

  useEffect(() => {
    if (hasStartedUpload && !isUploading && isWaitingToClear) {
      clearForm();
    }
  }, [hasStartedUpload, isUploading, isWaitingToClear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      const response = await api.PromotionService.createPromotion(
        {
          title,
          audience,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          chooseAttachments:
            selectedAttachments.length > 0 ? selectedAttachments : undefined,
        } as any,
        hasFilesToUpload
      );

      const { promotion, fileHubUploadKey, uploadKey } = response as any;

      if (promotion?.id && selectedAttachments.length > 0) {
        // Move "My Files" selections for this new promotion into existing attachments
        moveCurrentNewTargetSelectionsToExisting(promotion.id);
      }

      addToast({
        message: "Promotion Created Successfully",
        type: "success",
      });

      if (hasFilesToUpload) {
        const uploadKeyToUse = fileHubUploadKey || uploadKey;
        if (uploadKeyToUse) {
          try {
            setUploadKeyV3(uploadKeyToUse);
            // Wait for uploads to complete before clearing the form
            setIsWaitingToClear(true);
          } catch (uploadErr: any) {
            addToast({
              message:
                uploadErr?.message ||
                "Failed to upload new attachments. Please try again.",
              type: "error",
            });
            // Clear form even if upload key setting fails
            clearForm();
          }
        } else {
          addToast({
            message:
              "Missing upload key for new attachments. Please retry the upload.",
            type: "error",
          });
          // Clear form even if upload key is missing
          clearForm();
        }
      } else {
        // No files to upload, clear form immediately
        clearForm();
      }
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
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
          <option value={AudienceType.ALL}>All</option>
          <option value={AudienceType.CUSTOMER}>Customer</option>
          <option value={AudienceType.SUPERVISOR}>Supervisor</option>
          <option value={AudienceType.EMPLOYEE}>Employee</option>
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
          <AttachmentInputV3
            uploadKey={uploadKeyV3 ?? undefined}
            uploadWhenKeyProvided={true}
            onSelectedAttachmentsChange={handleSelectedAttachmentsChange}
            onHasFilesToUpload={setHasFilesToUpload}
            onUploadStart={() => {
              setHasStartedUpload(true);
              setIsUploading(true);
            }}
            onUploadEnd={() => setIsUploading(false)}
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
