"use client";

import { useState, useEffect } from "react";
import { DepartmentsService } from "@/lib/api";
import { DepartmentVisibility, Department } from "@/lib/api/departments";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import useFormErrors from "@/hooks/useFormErrors";
import Modal from "./Modal";

export default function CategoryModal() {
    const { modal, closeModal, addCategory, updateCategory } = useCategoriesStore();
    const { addToast } = useToastStore();
    const { clearErrors, setErrors, setRootError, errors } = useFormErrors(["name", "visibility"]);

    const category = modal.data as Department | null;
    const isEdit = modal.mode === "edit";

    const [name, setName] = useState("");
    const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
    const [knowledge, setKnowledge] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setVisibility(category.visibility as "PUBLIC" | "PRIVATE");
        } else {
            setName("");
            setVisibility("PUBLIC");
            setKnowledge("");
        }
        clearErrors();
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        setIsLoading(true);

        try {
            const dto = {
                name,
                visibility: DepartmentVisibility[visibility],
                knowledgeChunkContent: !isEdit && knowledge ? knowledge : undefined,
            };

            if (isEdit && category) {
                const updated = await DepartmentsService.updateMainDepartment(category.id, dto);
                updateCategory(category.id, { name: updated.name, visibility: updated.visibility });
                addToast({ message: "Category updated", type: "success" });
            } else {
                const created = await DepartmentsService.createDepartment(dto);
                addCategory({ id: created.id, name: created.name, visibility: created.visibility });
                addToast({ message: "Category created", type: "success" });
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
        <Modal title={isEdit ? "Edit Category" : "Add Category"} onClose={closeModal}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {errors.root}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Category Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                        placeholder="Enter category name"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Visibility
                    </label>
                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                    </select>
                    {errors.visibility && <p className="mt-1 text-sm text-red-600">{errors.visibility}</p>}
                </div>

                {!isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Initial Knowledge (Optional)
                        </label>
                        <textarea
                            value={knowledge}
                            onChange={(e) => setKnowledge(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 min-h-[80px]"
                            placeholder="Enter initial knowledge..."
                        />
                    </div>
                )}

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
                        {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Create"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
