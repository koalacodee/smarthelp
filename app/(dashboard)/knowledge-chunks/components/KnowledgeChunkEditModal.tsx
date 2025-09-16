"use client";
import { useEffect, useState } from "react";
import { useKnowledgeChunkModalStore } from "../store/useKnowledgeChunkModalStore";
import { DepartmentsService, KnowledgeChunksService } from "@/lib/api";
import { useKnowledgeChunksStore } from "../store/useKnowledgeChunksStore";
import { CreateKnowledgeChunkRequest } from "@/lib/api/sdk/models";
import XCircle from "@/icons/XCircle";
import Plus from "@/icons/Plus";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";

export default function KnowledgeChunkEditModal() {
  const { isOpen, mode, chunk, closeModal } = useKnowledgeChunkModalStore();
  const { addChunk, updateChunk, chunks } = useKnowledgeChunksStore();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [formData, setFormData] = useState<CreateKnowledgeChunkRequest>({
    content: "",
    departmentId: "",
  });

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
      const chunks = response.data.data || [];
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
    setLoading(true);

    try {
      if (mode === "edit" && chunk?.id) {
        // Delete old chunk and create new one
        await KnowledgeChunksService.deleteKnowledgeChunk(chunk.id);
        const response = await KnowledgeChunksService.createKnowledgeChunk(
          formData
        );
        if (response.data.data) {
          // Refresh the entire list instead of trying to update
          const refreshResponse =
            await KnowledgeChunksService.getAllKnowledgeChunks();
          const groupedMap = new Map<string, any>();

          (refreshResponse.data.data || []).forEach((chunk) => {
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
        const response = await KnowledgeChunksService.createKnowledgeChunk(
          formData
        );
        if (response.data.data) {
          // Refresh the entire list
          const refreshResponse =
            await KnowledgeChunksService.getAllKnowledgeChunks();
          const groupedMap = new Map<string, any>();

          (refreshResponse.data.data || []).forEach((chunk) => {
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
    } catch (error) {
      console.error("Error saving knowledge chunk:", error);
      useToastStore
        .getState()
        .addToast({ message: "Failed to save knowledge chunk", type: "error" });
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
          </div>

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
