"use client";

import { useState, useMemo } from "react";
import { useCategoriesStore } from "../store/useCategoriesStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import SubCategoryRow from "./SubCategoryRow";
import SearchInput from "./SearchInput";

interface SubCategoriesTableProps {
    showParentFilter: boolean;
}

export default function SubCategoriesTable({ showParentFilter }: SubCategoriesTableProps) {
    const { subCategories, categories } = useCategoriesStore();
    const { locale } = useLocaleStore();
    const [search, setSearch] = useState("");
    const [parentFilter, setParentFilter] = useState("");

    const filtered = useMemo(() => {
        return subCategories.filter((sub) => {
            const matchesSearch = !search || sub.name.toLowerCase().includes(search.toLowerCase());
            const matchesParent = !parentFilter || sub.parent?.id === parentFilter || sub.parentId === parentFilter;
            return matchesSearch && matchesParent;
        });
    }, [subCategories, search, parentFilter]);

    if (!locale) return null;

    return (
        <section className="bg-white/90 rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 animation-delay-100">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg" />
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">{locale.categories.subCategoriesTable.title}</h3>
                        <p className="text-xs text-slate-600">{locale.categories.subCategoriesTable.description}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={locale.categories.subCategoriesTable.searchPlaceholder}
                />

                {showParentFilter && (
                    <select
                        value={parentFilter}
                        onChange={(e) => setParentFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[180px] transition-all"
                    >
                        <option value="">{locale.categories.subCategoriesTable.allCategories}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-4 py-12 text-center text-slate-500">
                                    {subCategories.length === 0
                                        ? locale.categories.subCategoriesTable.noSubCategories
                                        : locale.categories.subCategoriesTable.noMatches}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((sub, index) => (
                                <SubCategoryRow
                                    key={sub.id}
                                    subCategory={sub}
                                    animationDelay={index * 40}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
