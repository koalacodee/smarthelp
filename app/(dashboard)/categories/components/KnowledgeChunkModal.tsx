"use client";

import { useState, useEffect } from "react";
import { KnowledgeChunkService } from "@/lib/api/v2";
import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import useFormErrors from "@/hooks/useFormErrors";
import Modal from "./Modal";

export default function KnowledgeChunkModal() {
    const { modal, closeModal, categories, addKnowledgeChunk, updateKnowledgeChunk } = useCategoriesStore();
    const { addToast } = useToastStore();
    const { clearErrors, setErrors, setRootError, errors } = useFormErrors(["content", "departmentId"]);

    const chunk = modal.data as KnowledgeChunk | null;
    const isEdit = modal.mode === "edit";

    const [content, setContent] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEdit && chunk) {
            setContent(chunk.content);
            setCategoryId(modal.parentId || "");
        } else {
            setContent("");
            setCategoryId(modal.parentId || "");
        }
        clearErrors();
    }, [chunk, modal.parentId, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        setIsLoading(true);

        try {
            if (isEdit && chunk) {
                const result = await KnowledgeChunkService.updateKnowledgeChunk({
                    id: chunk.id,
                    content,
                    departmentId: categoryId,
                });
                updateKnowledgeChunk(categoryId, result.knowledgeChunk);
                addToast({ message: "Knowledge chunk updated", type: "success" });
            } else {
                const result = await KnowledgeChunkService.createKnowledgeChunk({
                    content,
                    departmentId: categoryId,
                });
                addKnowledgeChunk(categoryId, result.knowledgeChunk);
                addToast({ message: "Knowledge chunk created", type: "success" });
            }

            closeModal();
        } catch (error: any) {
            if (error?.response?.data?.data?.details) {
                setErrors(error.response.data.data.details);
            } else {
                setRootError(error?.response?.data?.message || "Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal title={isEdit ? "Edit Knowledge Chunk" : "Add Knowledge Chunk"} onClose={closeModal}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {errors.root}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Content
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 min-h-[150px]"
                        placeholder="Enter knowledge content..."
                        required
                    />
                    {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Category
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        required
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
