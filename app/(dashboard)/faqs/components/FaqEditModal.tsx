"use client";
import React, { useState, useEffect, useMemo } from "react";
import AttachmentInput from "@/components/ui/AttachmentInput";
import api, { FileService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingFAQStore } from "../store/useCurrentEditingFAQ";
import { Department } from "@/lib/api/departments";
import { useGroupedFAQsStore } from "../store/useGroupedFAQsStore";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { FAQService, UploadService } from "@/lib/api/v2";

export default function FaqEditModal() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [subDepartmentId, setSubDepartmentId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);
  const [attachmentRefreshKey, setAttachmentRefreshKey] = useState(0);
  const { addToast } = useToastStore();
  const { faq, setIsEditing, isEditing } = useCurrentEditingFAQStore();
  const { addFAQ, updateFAQ } = useGroupedFAQsStore();
  const { getFormData, attachments } = useAttachmentStore();
  const { getAttachments, addAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const { addExistingAttachment } = useAttachmentStore();

  useEffect(() => {
    Promise.all([
      api.DepartmentsService.getAllDepartments().then(setDepartments),
      api.DepartmentsService.getAllSubDepartments().then(setSubDepartments),
    ]);
  }, []);
  const {
    existingsToDelete,
    clearAttachments,
    clearExistingsToDelete,
    setExistingAttachments,
    // addExistingAttachment,
  } = useAttachmentStore();

  const subDepartmentsForCategory = useMemo(() => {
    if (!departmentId) return [];
    return subDepartments.filter((sd) => sd.parent?.id === departmentId);
  }, [departmentId, subDepartments]);

  // Effect to handle FAQ changes and load initial data
  useEffect(() => {
    if (faq) {
      const init = async () => {
        setQuestion(faq.text);
        setAnswer(faq.answer || "");
        if (departments.find((dept) => dept.id == faq.departmentId)) {
          setDepartmentId(faq.departmentId);
        } else {
          setSubDepartmentId(faq.departmentId);
        }
      };
      init();
    } else {
      // Reset for new FAQ, default to first available category
      setQuestion("");
      setAnswer("");
      const firstCatId = departments[0]?.id || "";
      setDepartmentId(firstCatId);
      setSubDepartmentId(null);
    }
  }, [faq, departments]);

  // Separate effect to handle attachment loading when FAQ changes or attachments are updated
  useEffect(() => {
    // Clear existing attachments first
    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});
    if (faq) {
      const loadAttachments = async () => {
        const promises = getAttachments("faq", faq.id).map((id) =>
          FileService.getAttachmentMetadata(id).then((m) => {
            setMetadata(id, m);
            addExistingAttachment(id, m);
            return [id, m];
          })
        );

        await Promise.all(promises);
      };
      loadAttachments();
    }
  }, [faq?.id, attachmentRefreshKey]); // Include refresh key to reload when attachments are updated

  // Effect to refresh attachments when modal opens
  useEffect(() => {
    if (isEditing && faq) {
      setAttachmentRefreshKey((prev) => prev + 1);
    }
  }, [isEditing, faq?.id]);

  useEffect(() => {
    // When category changes, reset sub-department if it's no longer valid
    if (!subDepartmentsForCategory.some((sd) => sd.id === subDepartmentId)) {
      setSubDepartmentId(null);
    }
  }, [departmentId, subDepartmentsForCategory, subDepartmentId]);

  const handleClose = () => {
    setIsEditing(false);
    // Reset attachment refresh key when closing
    setAttachmentRefreshKey(0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer || !departmentId) {
      alert("Please fill all fields.");
      return;
    }

    const deptId = subDepartmentId ?? departmentId;

    const formData = attachments.length > 0 ? getFormData() : undefined;
    if (faq) {
      FAQService.updateQuestion(faq.id, {
        text: question,
        answer,
        departmentId: deptId,
        deleteAttachments: Object.keys(existingsToDelete),
        attach: attachments.length > 0,
      })
        .then(async (response) => {
          const { question: updated } = response;
          addToast({
            message: "FAQ Updated Successfully!",
            type: "success",
          });
          // Simply update the FAQ in the store
          updateFAQ(faq.departmentId, faq.id, {
            id: faq.id,
            text: updated.text || question,
            answer: updated.answer || answer,
            departmentId: deptId,
            departmentName: [...departments, ...subDepartments].find(
              (dept) => dept.id === deptId
            )?.name,
          });
          handleClose();
          if (formData && response.uploadKey) {
            const uploadedFilesResponse =
              await UploadService.uploadFromFormData(
                formData,
                response.uploadKey
              );

            console.log(uploadedFilesResponse);

            if (uploadedFilesResponse) {
              const { data: uploadedFiles } = uploadedFilesResponse;
              if (Array.isArray(uploadedFiles)) {
                addAttachments(
                  "faq",
                  faq.id,
                  uploadedFiles.map((file) => file.id)
                );
              } else {
                addAttachments("faq", faq.id, [uploadedFiles.id]);
              }
              // Trigger attachment refresh to reload the modal
              setAttachmentRefreshKey((prev) => prev + 1);
            }
          }
        })
        .catch((error) => {
          addToast({
            message: "Failed to update FAQ",
            type: "error",
          });
          console.error("Update FAQ error:", error);
        });
    } else {
      FAQService.createQuestion({
        text: question,
        answer,
        departmentId: deptId,
        attach: attachments.length > 0,
      })
        .then(async (response) => {
          const { question: created } = response;
          addToast({
            message: "FAQ Added Successfully!",
            type: "success",
          });
          // Add the new FAQ to the store
          addFAQ(deptId, {
            id: created.id!,
            text: created.text || question,
            answer: created.answer || answer,
            departmentId: deptId,
            satisfaction: 0,
            dissatisfaction: 0,
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          handleClose();
          if (formData && response.uploadKey) {
            const uploadedFilesResponse =
              await UploadService.uploadFromFormData(
                formData,
                response.uploadKey
              );

            console.log(uploadedFilesResponse);

            if (uploadedFilesResponse) {
              const { data: uploadedFiles } = uploadedFilesResponse;
              if (Array.isArray(uploadedFiles)) {
                addAttachments(
                  "faq",
                  created.id!,
                  uploadedFiles.map((file) => file.id)
                );
              } else {
                addAttachments("faq", created.id!, [uploadedFiles.id]);
              }
              // Trigger attachment refresh to reload the modal
              setAttachmentRefreshKey((prev) => prev + 1);
            }
          }
        })
        .catch((error) => {
          addToast({
            message: "Failed to add FAQ",
            type: "error",
          });
          console.error("Create FAQ error:", error);
        });
    }

    // Clear attachment store state

    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});
  };

  const modalTitle = faq && faq.answer ? "Edit FAQ" : "Add New FAQ";
  const selectedCategoryName =
    departments.find((c) => c.id === departmentId)?.name || "Category";

  if (!isEditing) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <h3 className="text-xl font-bold mb-6 text-slate-800">
            {modalTitle}
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="faq-question"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Question
              </label>
              <input
                id="faq-question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="faq-answer"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Answer
              </label>
              <textarea
                id="faq-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Provide a detailed answer to the question."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="faq-category-modal"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Main Category
                </label>
                <select
                  id="faq-category-modal"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  {departments.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="faq-subdepartment-modal"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Sub-department (Optional)
                </label>
                <select
                  id="faq-subdepartment-modal"
                  value={subDepartmentId || ""}
                  onChange={(e) => setSubDepartmentId(e.target.value || null)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:opacity-50"
                  disabled={subDepartmentsForCategory.length == 0}
                >
                  <option value="">
                    {subDepartmentsForCategory.length !== 0
                      ? `All of ${selectedCategoryName}`
                      : "No Sub-Departments"}
                  </option>
                  {subDepartmentsForCategory.map((sd) => (
                    <option key={sd.id} value={sd.id}>
                      {sd.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <AttachmentInput
              id="faq-attachment-input"
              attachmentType="faq"
              attachmentId={faq?.id}
              getAttachmentTokens={getAttachments}
            />
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
