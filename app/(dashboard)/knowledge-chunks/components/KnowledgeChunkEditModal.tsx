"use client";
import { useEffect, useState } from "react";
import { useKnowledgeChunkModalStore } from "../store/useKnowledgeChunkModalStore";
import { DepartmentsService, KnowledgeChunksService } from "@/lib/api";
import { useKnowledgeChunksStore } from "../store/useKnowledgeChunksStore";
import { CreateKnowledgeChunkRequest } from "@/lib/api/sdk/models";
import XCircle from "@/icons/XCircle";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import AttachmentInput from "@/components/ui/AttachmentInput";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import useFormErrors from "@/hooks/useFormErrors";

export default function KnowledgeChunkEditModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "content",
    "departmentId",
  ]);
  const { isOpen, mode, chunk, closeModal } = useKnowledgeChunkModalStore();
  const { addChunk, updateChunk, chunks } = useKnowledgeChunksStore();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [formData, setFormData] = useState<CreateKnowledgeChunkRequest>({
    content: "",
    departmentId: "",
  });
  const { getFormData } = useAttachmentStore();

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      if (mode === "edit" && chunk?.id) {
        loadChunk();
      } else {
        setFormData({ content: "", departmentId: "" });
      }
    }
  }, [isOpen, mode, chunk?.id]);

  async function loadDepartments() {
    try {
      const departments = await DepartmentsService.getAllDepartments();
      setDepartments(departments);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  }

  async function loadChunk() {
    if (!chunk?.id) return;

    setLoading(true);
    try {
      const response = await KnowledgeChunksService.getAllKnowledgeChunks();
      const chunks = response.knowledgeChunks || [];
      const existingChunk = chunks.find((c) => c.id === chunk.id);

      if (existingChunk) {
        setFormData({
          content: existingChunk.content || "",
          departmentId: existingChunk.department?.id || "",
        });
      }
    } catch (error) {
      console.error("Error loading chunk:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    try {
      if (mode === "edit" && chunk?.id) {
        // Delete old chunk and create new one
        await KnowledgeChunksService.deleteKnowledgeChunk(chunk.id);
        // Get FormData from attachment store
        const attachmentFormData =
          attachments.length > 0 ? getFormData() : undefined;

        const response = await KnowledgeChunksService.createKnowledgeChunk(
          formData,
          attachmentFormData
        );
        if (response.data.data) {
          // Refresh the entire list instead of trying to update
          const refreshResponse =
            await KnowledgeChunksService.getAllKnowledgeChunks();
          const groupedMap = new Map<string, any>();

          (refreshResponse.knowledgeChunks || []).forEach((chunk) => {
            const dept = chunk.department;
            if (dept) {
              const key = dept.id;
              if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                  departmentId: key,
                  departmentName: dept.name,
                  chunks: [],
                });
              }
              groupedMap.get(key)!.chunks.push(chunk);
            }
          });

          // Use any to bypass type issues
          (useKnowledgeChunksStore.getState() as any).setChunks(
            Array.from(groupedMap.values())
          );
        }
      } else {
        // Get FormData from attachment store
        const attachmentFormData =
          attachments.length > 0 ? getFormData() : undefined;

        const response = await KnowledgeChunksService.createKnowledgeChunk(
          formData,
          attachmentFormData
        );
        if (response.data.data) {
          // Refresh the entire list
          const refreshResponse =
            await KnowledgeChunksService.getAllKnowledgeChunks();
          const groupedMap = new Map<string, any>();

          (refreshResponse.knowledgeChunks || []).forEach((chunk) => {
            const dept = chunk.department;
            if (dept) {
              const key = dept.id;
              if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                  departmentId: key,
                  departmentName: dept.name,
                  chunks: [],
                });
              }
              groupedMap.get(key)!.chunks.push(chunk);
            }
          });

          (useKnowledgeChunksStore.getState() as any).setChunks(
            Array.from(groupedMap.values())
          );
        }
      }
      useToastStore.getState().addToast({
        message: "Knowledge chunk saved successfully",
        type: "success",
      });
      closeModal();
    } catch (error: any) {
      console.error("Error saving knowledge chunk:", error);
      console.log("Knowledge chunk save error:", error);
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
            "Failed to save knowledge chunk. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">
            {mode === "edit" ? "Edit Knowledge Chunk" : "Add Knowledge Chunk"}
          </h3>
          <button
            type="button"
            onClick={closeModal}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.root && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
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
              htmlFor="content"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              rows={8}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px]"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              disabled={loading}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-700">{errors.content}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Department
            </label>
            <select
              id="department"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={formData.departmentId}
              onChange={(e) =>
                setFormData({ ...formData, departmentId: e.target.value })
              }
              required
              disabled={loading}
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-700">{errors.departmentId}</p>
            )}
          </div>

          <AttachmentInput
            id="knowledge-chunk-attachment"
            onAttachmentsChange={setAttachments}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-md border border-border transition-colors"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md border border-transparent transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
