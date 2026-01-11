"use client";

import { useEffect } from "react";
import { Department } from "@/lib/api/departments";
import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import { Locale } from "@/locales/type";
import { useCategoriesStore } from "../store/useCategoriesStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import CategoriesList from "./CategoriesList";
import SubCategoriesTable from "./SubCategoriesTable";
import ModalContainer from "./ModalContainer";

interface CategoriesClientProps {
  initialCategories: Department[];
  initialSubCategories: Department[];
  initialKnowledgeChunks: Record<string, KnowledgeChunk[]>;
  userRole: string;
  locale: Locale;
  language: string;
}

export default function CategoriesClient({
  initialCategories,
  initialSubCategories,
  initialKnowledgeChunks,
  userRole,
  locale,
  language,
}: CategoriesClientProps) {
  const { initialize } = useCategoriesStore();
  const { setLocale } = useLocaleStore();

  useEffect(() => {
    initialize({
      categories: initialCategories,
      subCategories: initialSubCategories,
      knowledgeChunks: initialKnowledgeChunks,
    });
  }, [initialize, initialCategories, initialSubCategories, initialKnowledgeChunks]);

  useEffect(() => {
    setLocale(locale, language);
  }, [locale, language, setLocale]);

  const isAdmin = userRole === "ADMIN";

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {isAdmin && <CategoriesList />}
        <SubCategoriesTable showParentFilter={isAdmin} />
      </div>
      <ModalContainer />
    </>
  );
}
