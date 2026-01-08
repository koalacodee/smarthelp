"use client";

import { useEffect } from "react";
import { Department } from "@/lib/api/departments";
import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import { useCategoriesStore } from "../store/useCategoriesStore";
import CategoriesList from "./CategoriesList";
import SubCategoriesTable from "./SubCategoriesTable";
import ModalContainer from "./ModalContainer";

interface CategoriesClientProps {
  initialCategories: Department[];
  initialSubCategories: Department[];
  initialKnowledgeChunks: Record<string, KnowledgeChunk[]>;
  userRole: string;
}

export default function CategoriesClient({
  initialCategories,
  initialSubCategories,
  initialKnowledgeChunks,
  userRole,
}: CategoriesClientProps) {
  const { initialize } = useCategoriesStore();

  useEffect(() => {
    initialize({
      categories: initialCategories,
      subCategories: initialSubCategories,
      knowledgeChunks: initialKnowledgeChunks,
    });
  }, []);

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
