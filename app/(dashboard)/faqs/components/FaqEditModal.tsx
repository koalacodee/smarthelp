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

export default function FaqEditModal() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [subDepartmentId, setSubDepartmentId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);
  const { addToast } = useToastStore();
  const { faq, setIsEditing, isEditing } = useCurrentEditingFAQStore();
  const { addFAQ, updateFAQ } = useGroupedFAQsStore();
  const { getFormData } = useAttachmentStore();
  const { getAttachments } = useAttachmentsStore();
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
  } = useAttachmentStore();

  const subDepartmentsForCategory = useMemo(() => {
    if (!departmentId) return [];
    return subDepartments.filter((sd) => sd.parent?.id === departmentId);
  }, [departmentId, subDepartments]);

  useEffect(() => {
    // Clear attachment store state
    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});
    if (faq) {
      const init = async () => {
        setQuestion(faq.text);
        setAnswer(faq.answer || "");
        setDepartmentId(faq.departmentId);
        const promises = getAttachments("faq", faq.id).map((id) =>
          FileService.getAttachmentMetadata(id).then((m) => {
            setMetadata(id, m);
            addExistingAttachment(id, m);
            return [id, m];
          })
        );

        await Promise.all(promises);
      };
      init();
    } else {
      // Reset for new FAQ, default to first available category
      setQuestion("");
      setAnswer("");
      const firstCatId = departments[0]?.id || "";
      setDepartmentId(firstCatId);
      setSubDepartmentId(null);
      setAttachments([]);
    }
  }, [faq, departments]);

  useEffect(() => {
    // When category changes, reset sub-department if it's no longer valid
    if (!subDepartmentsForCategory.some((sd) => sd.id === subDepartmentId)) {
      setSubDepartmentId(null);
    }
  }, [departmentId, subDepartmentsForCategory, subDepartmentId]);

  const handleClose = () => {
    setIsEditing(false);
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
      api.FAQsService.updateQuestion(
        faq.id,
        {
          text: question,
          answer,
          departmentId: deptId,
          deleteAttachments: Object.keys(existingsToDelete),
        },
        formData
      )
        .then((response) => {
          addToast({
            message: "FAQ Updated Successfully!",
            type: "success",
          });
          updateFAQ(deptId, faq.id, {
            id: faq.id,
            text: question,
            answer,
            departmentId: deptId,
            departmentName: [...departments, ...subDepartments].find(
              (dept) => dept.id === deptId
            )?.name,
          });
          handleClose();
        })
        .catch((error) => {
          addToast({
            message: "Failed to update FAQ",
            type: "error",
          });
          console.error("Update FAQ error:", error);
        });
    } else {
      api.FAQsService.createQuestion(
        {
          text: question,
          answer,
          departmentId: subDepartmentId ?? departmentId,
        },
        formData
      )
        .then((response) => {
          addToast({
            message: "FAQ Added Successfully!",
            type: "success",
          });
          addFAQ(deptId, response);
          handleClose();
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
              onAttachmentsChange={setAttachments}
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
