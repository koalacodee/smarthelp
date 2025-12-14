"use client";
import { useEffect, useState } from "react";
import { useKnowledgeChunkModalStore } from "../store/useKnowledgeChunkModalStore";
import { DepartmentsService, KnowledgeChunksService } from "@/lib/api";
import { useKnowledgeChunksStore } from "../store/useKnowledgeChunksStore";
import { CreateKnowledgeChunkRequest } from "@/lib/api/sdk/models";
import XCircle from "@/icons/XCircle";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import useFormErrors from "@/hooks/useFormErrors";
import { motion } from "framer-motion";

export default function KnowledgeChunkEditModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "content",
    "departmentId",
  ]);
  const { isOpen, mode, chunk, closeModal, preSelectedDepartmentId } =
    useKnowledgeChunkModalStore();
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
        setFormData({
          content: "",
          departmentId: preSelectedDepartmentId || "",
        });
      }
    }
  }, [isOpen, mode, chunk?.id, preSelectedDepartmentId]);

  async function loadDepartments() {
    try {
      const departments = await DepartmentsService.getAllDepartments();
      setDepartments(departments);
    } catch (error) {
      // Error loading departments
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
      // Error loading chunk
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

        const response = await KnowledgeChunksService.createKnowledgeChunk(
          formData
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
        const response = await KnowledgeChunksService.createKnowledgeChunk(
          formData
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
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4"
      onClick={closeModal}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div className="flex justify-between items-center p-6 border-b border-gray-200">
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent"
          >
            {mode === "edit" ? "Edit Knowledge Chunk" : "Add Knowledge Chunk"}
          </motion.h3>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={closeModal}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </motion.button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          {errors.root && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <motion.svg
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2,
                    ease: "backOut",
                  }}
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
                </motion.svg>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  {errors.root}
                </motion.span>
              </motion.div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              htmlFor="content"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Content
            </motion.label>
            <motion.textarea
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              whileFocus={{
                scale: 1.02,
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
              }}
              id="content"
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[200px] transition-all duration-200"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              disabled={loading}
            />
            {errors.content && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-1 text-sm text-red-700"
              >
                {errors.content}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              htmlFor="department"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Department
            </motion.label>
            <motion.select
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              whileFocus={{
                scale: 1.02,
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
              }}
              id="department"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
            </motion.select>
            {errors.departmentId && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-1 text-sm text-red-700"
              >
                {errors.departmentId}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex justify-end space-x-3 pt-4"
          >
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgb(148 163 184)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.4)",
                backgroundColor: "rgb(37 99 235)",
              }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
