"use client";

import { useState } from "react";
import { Department } from "@/lib/api/departments";
import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import Arrow from "@/icons/Arrow";
import EyeIcon from "@/icons/Eye";
import EyeSlashIcon from "@/icons/EyeSlash";
import PlusIcon from "@/icons/Plus";
import CategoryActions from "./CategoryActions";
import KnowledgeChunkItem from "./KnowledgeChunkItem";
import { useCategoriesStore } from "../store/useCategoriesStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface CategoryCardProps {
  category: Department;
  knowledgeChunks: KnowledgeChunk[];
}

export default function CategoryCard({
  category,
  knowledgeChunks,
}: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openModal } = useCategoriesStore();
  const { locale } = useLocaleStore();

  const handleAddChunk = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal("knowledgeChunk", "add", null, category.id);
  };

  if (!locale) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <span
            className={`transform transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            <Arrow className="w-4 h-4 text-slate-500" />
          </span>

          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-800">{category.name}</h4>
            <VisibilityBadge visibility={category.visibility} />
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAddChunk}
            className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            title={locale.categories.categoryCard.addKnowledgeChunk}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <CategoryActions category={category} />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 bg-white p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {knowledgeChunks.length === 0 ? (
            <p className="text-center py-4 text-slate-500 text-sm italic">
              {locale.categories.categoryCard.noKnowledgeChunks}
            </p>
          ) : (
            <div className="space-y-2">
              {knowledgeChunks.map((chunk, index) => (
                <div
                  key={chunk.id}
                  className="animate-stagger fill-both"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <KnowledgeChunkItem chunk={chunk} categoryId={category.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  const { locale } = useLocaleStore();
  const isPublic = visibility === "PUBLIC";

  if (!locale) return null;

  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
        isPublic ? "text-green-700 bg-green-100" : "text-slate-700 bg-slate-200"
      }`}
    >
      {isPublic ? (
        <EyeIcon className="w-3 h-3" />
      ) : (
        <EyeSlashIcon className="w-3 h-3" />
      )}
      {isPublic
        ? locale.categories.categoryCard.public
        : locale.categories.categoryCard.private}
    </span>
  );
}
