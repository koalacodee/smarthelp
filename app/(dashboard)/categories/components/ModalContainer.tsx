"use client";

import { useCategoriesStore } from "../store/useCategoriesStore";
import CategoryModal from "./CategoryModal";
import SubCategoryModal from "./SubCategoryModal";
import KnowledgeChunkModal from "./KnowledgeChunkModal";

export default function ModalContainer() {
    const { modal } = useCategoriesStore();

    return (
        <>
            {modal.type === "category" && <CategoryModal />}
            {modal.type === "subCategory" && <SubCategoryModal />}
            {modal.type === "knowledgeChunk" && <KnowledgeChunkModal />}
        </>
    );
}
