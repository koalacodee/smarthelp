import { create } from "zustand";
import { Department } from "@/lib/api/departments";
import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";

export interface CategoriesState {
    // Categories (Main Departments)
    categories: Department[];
    setCategories: (categories: Department[]) => void;
    addCategory: (category: Department) => void;
    updateCategory: (id: string, updates: Partial<Department>) => void;
    removeCategory: (id: string) => void;
    getCategoryById: (id: string) => Department | undefined;

    // Sub-categories (Sub Departments)
    subCategories: Department[];
    setSubCategories: (subCategories: Department[]) => void;
    addSubCategory: (subCategory: Department) => void;
    updateSubCategory: (id: string, updates: Partial<Department>) => void;
    removeSubCategory: (id: string) => void;
    getSubCategoryById: (id: string) => Department | undefined;
    getSubCategoriesByParentId: (parentId: string) => Department[];

    // Categories Map (parentId -> sub-categories)
    categoriesMap: Record<string, Department[]>;
    rebuildCategoriesMap: () => void;

    // Knowledge Chunks (categoryId -> chunks)
    knowledgeChunks: Record<string, KnowledgeChunk[]>;
    setKnowledgeChunks: (chunks: Record<string, KnowledgeChunk[]>) => void;
    addKnowledgeChunk: (categoryId: string, chunk: KnowledgeChunk) => void;
    updateKnowledgeChunk: (categoryId: string, chunk: KnowledgeChunk) => void;
    removeKnowledgeChunk: (categoryId: string, chunkId: string) => void;
    getKnowledgeChunksByCategory: (categoryId: string) => KnowledgeChunk[];

    // Initialization
    initialize: (data: {
        categories?: Department[];
        subCategories?: Department[];
        knowledgeChunks?: Record<string, KnowledgeChunk[]>;
    }) => void;

    // Modal States
    modal: {
        type: "category" | "subCategory" | "knowledgeChunk" | null;
        mode: "add" | "edit";
        data?: Department | KnowledgeChunk | null;
        parentId?: string;
    };
    openModal: (
        type: "category" | "subCategory" | "knowledgeChunk",
        mode: "add" | "edit",
        data?: Department | KnowledgeChunk | null,
        parentId?: string
    ) => void;
    closeModal: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
    // Categories
    categories: [],

    setCategories: (categories) => {
        set({ categories });
        get().rebuildCategoriesMap();
    },

    addCategory: (category) => {
        set((state) => ({ categories: [...state.categories, category] }));
    },

    updateCategory: (id, updates) => {
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === id ? { ...cat, ...updates } : cat
            ),
        }));
    },

    removeCategory: (id) => {
        set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
        }));
    },

    getCategoryById: (id) => get().categories.find((cat) => cat.id === id),

    // Sub-categories
    subCategories: [],

    setSubCategories: (subCategories) => {
        set({ subCategories });
        get().rebuildCategoriesMap();
    },

    addSubCategory: (subCategory) => {
        set((state) => ({
            subCategories: [...state.subCategories, subCategory],
        }));
        get().rebuildCategoriesMap();
    },

    updateSubCategory: (id, updates) => {
        set((state) => ({
            subCategories: state.subCategories.map((sub) =>
                sub.id === id ? { ...sub, ...updates } : sub
            ),
        }));
        get().rebuildCategoriesMap();
    },

    removeSubCategory: (id) => {
        set((state) => ({
            subCategories: state.subCategories.filter((sub) => sub.id !== id),
        }));
        get().rebuildCategoriesMap();
    },

    getSubCategoryById: (id) => get().subCategories.find((sub) => sub.id === id),

    getSubCategoriesByParentId: (parentId) =>
        get().subCategories.filter(
            (sub) => sub.parentId === parentId || sub.parent?.id === parentId
        ),

    // Categories Map
    categoriesMap: {},

    rebuildCategoriesMap: () => {
        const { categories, subCategories } = get();
        const map: Record<string, Department[]> = {};

        categories.forEach((cat) => {
            map[cat.id] = subCategories.filter(
                (sub) => sub.parentId === cat.id || sub.parent?.id === cat.id
            );
        });

        set({ categoriesMap: map });
    },

    // Knowledge Chunks
    knowledgeChunks: {},

    setKnowledgeChunks: (chunks) => set({ knowledgeChunks: chunks }),

    addKnowledgeChunk: (categoryId, chunk) => {
        set((state) => ({
            knowledgeChunks: {
                ...state.knowledgeChunks,
                [categoryId]: [...(state.knowledgeChunks[categoryId] || []), chunk],
            },
        }));
    },

    updateKnowledgeChunk: (categoryId, chunk) => {
        set((state) => ({
            knowledgeChunks: {
                ...state.knowledgeChunks,
                [categoryId]: (state.knowledgeChunks[categoryId] || []).map((c) =>
                    c.id === chunk.id ? chunk : c
                ),
            },
        }));
    },

    removeKnowledgeChunk: (categoryId, chunkId) => {
        set((state) => ({
            knowledgeChunks: {
                ...state.knowledgeChunks,
                [categoryId]: (state.knowledgeChunks[categoryId] || []).filter(
                    (c) => c.id !== chunkId
                ),
            },
        }));
    },

    getKnowledgeChunksByCategory: (categoryId) =>
        get().knowledgeChunks[categoryId] || [],

    // Initialization
    initialize: (data) => {
        if (data.categories) set({ categories: data.categories });
        if (data.subCategories) set({ subCategories: data.subCategories });
        if (data.knowledgeChunks) set({ knowledgeChunks: data.knowledgeChunks });
        get().rebuildCategoriesMap();
    },

    // Modal States
    modal: {
        type: null,
        mode: "add",
        data: null,
        parentId: undefined,
    },

    openModal: (type, mode, data = null, parentId) => {
        set({ modal: { type, mode, data, parentId } });
    },

    closeModal: () => {
        set({ modal: { type: null, mode: "add", data: null, parentId: undefined } });
    },
}));
