"use client";

import { useCategoriesStore } from "../store/useCategoriesStore";
import CategoryCard from "./CategoryCard";

export default function CategoriesList() {
	const { categories, knowledgeChunks } = useCategoriesStore();

	return (
		<section className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
			<div className="flex items-center gap-3 px-1">
				<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg" />
				<div>
					<h2 className="text-lg font-semibold text-slate-800">Categories</h2>
					<p className="text-xs text-slate-600">Manage main categories & knowledge</p>
				</div>
			</div>

			<div className="space-y-3">
				{categories.length === 0 ? (
					<EmptyState />
				) : (
					categories.map((category, index) => (
						<div
							key={category.id}
							className="animate-stagger fill-both"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<CategoryCard
								category={category}
								knowledgeChunks={knowledgeChunks[category.id] || []}
							/>
						</div>
					))
				)}
			</div>
		</section>
	);
}

function EmptyState() {
	return (
		<div className="text-center py-12 text-slate-500 bg-white/50 rounded-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
			<p>No categories found</p>
			<p className="text-sm mt-1">Create your first category to get started</p>
		</div>
	);
}
