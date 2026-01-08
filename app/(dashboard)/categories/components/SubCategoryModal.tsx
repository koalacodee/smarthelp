"use client";

import { useState, useEffect } from "react";
import { DepartmentsService } from "@/lib/api";
import { Department } from "@/lib/api/departments";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import useFormErrors from "@/hooks/useFormErrors";
import Modal from "./Modal";

export default function SubCategoryModal() {
    const { modal, closeModal, categories, addSubCategory, updateSubCategory } = useCategoriesStore();
    const { addToast } = useToastStore();
    const { clearErrors, setErrors, setRootError, errors } = useFormErrors(["name", "parentId"]);

    const subCategory = modal.data as Department | null;
    const isEdit = modal.mode === "edit";

    const [name, setName] = useState("");
    const [parentId, setParentId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [availableParents, setAvailableParents] = useState<Department[]>([]);

    useEffect(() => {
        if (subCategory) {
            setName(subCategory.name);
            setParentId(subCategory.parent?.id || subCategory.parentId || "");
        } else {
            setName("");
            setParentId("");
        }
        clearErrors();
    }, [subCategory]);

    useEffect(() => {
        // Use categories from store if available, otherwise fetch
        if (categories.length > 0) {
            setAvailableParents(categories);
        } else {
            DepartmentsService.getAllDepartments().then(setAvailableParents);
        }
    }, [categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        setIsLoading(true);

        try {
            if (isEdit && subCategory) {
                const updated = await DepartmentsService.updateSubDepartment(subCategory.id, {
                    name,
                    parentId,
                });
                updateSubCategory(subCategory.id, updated);
                addToast({ message: "Sub-category updated", type: "success" });
            } else {
                const created = await DepartmentsService.createSubDepartment({ name, parentId });
                addSubCategory({
                    id: created.id,
                    name: created.name,
                    parent: created.parent,
                    visibility: created.visibility,
                    parentId: created.parent?.id,
                });
                addToast({ message: "Sub-category created", type: "success" });
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
        <Modal title={isEdit ? "Edit Sub-category" : "Add Sub-category"} onClose={closeModal}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {errors.root}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Sub-category Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                        placeholder="e.g., Domestic Shipping"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Parent Category
                    </label>
                    <select
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        required
                    >
                        <option value="" disabled>
                            Select a parent category
                        </option>
                        {availableParents.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.parentId && <p className="mt-1 text-sm text-red-600">{errors.parentId}</p>}
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
                        {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Create"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
