"use client";

import { Department } from "@/lib/api/departments";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import SubCategoryActions from "./SubCategoryActions";

interface SubCategoryRowProps {
    subCategory: Department;
    animationDelay?: number;
}

export default function SubCategoryRow({ subCategory, animationDelay = 0 }: SubCategoryRowProps) {
    const { locale } = useLocaleStore();

    if (!locale) return null;

    return (
        <tr
            className="group hover:bg-slate-50 transition-colors animate-stagger fill-both"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div>
                        <p className="text-sm font-medium text-slate-900">
                            {subCategory.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {locale.categories.subCategoriesTable.underLabel} {subCategory.parent?.name || "Unknown"}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <SubCategoryActions subCategory={subCategory} />
            </td>
        </tr>
    );
}
