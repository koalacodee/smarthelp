"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Department } from "@/lib/api/departments";
import Arrow from "@/icons/Arrow";
import PlusIcon from "@/icons/Plus";
import EyeIcon from "@/icons/Eye";
import EyeSlashIcon from "@/icons/EyeSlash";
import DepartmentActions from "./DepartmentActions";
import { useKnowledgeChunkModalStore } from "@/app/(dashboard)/knowledge-chunks/store/useKnowledgeChunkModalStore";
import KnowledgeChunkActions from "@/app/(dashboard)/knowledge-chunks/components/KnowledgeChunkActions";
import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";

interface DepartmentAccordionProps {
  department: Department;
  knowledgeChunks: KnowledgeChunk[];
}

export default function DepartmentAccordion({
  department,
  knowledgeChunks,
}: DepartmentAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { openAddModal } = useKnowledgeChunkModalStore();

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const handleAddChunk = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddModal(department.id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={toggleAccordion}
      >
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Arrow className="w-5 h-5 text-slate-500" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-slate-800">
                {department.name}
              </h4>
              {department.visibility === "PUBLIC" ? (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <EyeIcon className="w-3 h-3" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                  <EyeSlashIcon className="w-3 h-3" /> Private
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddChunk}
            className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            title="Add Knowledge Chunk"
          >
            <PlusIcon className="w-4 h-4" />
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <DepartmentActions department={department} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-slate-200 bg-white p-4">
              {knowledgeChunks.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm italic">
                  No knowledge chunks found for this department.
                </div>
              ) : (
                <div className="space-y-2">
                  {knowledgeChunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                    >
                      <p className="text-sm text-slate-700 line-clamp-2 flex-1 mr-4">
                        {chunk.content}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <KnowledgeChunkActions
                          chunkId={chunk.id!}
                          departmentId={department.id}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
