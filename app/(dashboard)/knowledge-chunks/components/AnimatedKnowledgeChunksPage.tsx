"use client";

import React from "react";
import { motion } from "framer-motion";
import KnowledgeChunksTable from "./KnowledgeChunksTable";
import KnowledgeChunkEditModal from "./KnowledgeChunkEditModal";
import AnimatedKnowledgeChunksHeader from "./AnimatedKnowledgeChunksHeader";
import AddNewKnowledgeChunkButton from "./AddNewKnowledgeChunkButton";
import { GroupedKnowledgeChunks } from "../page";

interface AnimatedKnowledgeChunksPageProps {
  chunks?: GroupedKnowledgeChunks[];
}

export default function AnimatedKnowledgeChunksPage({
  chunks = [],
}: AnimatedKnowledgeChunksPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <AnimatedKnowledgeChunksHeader />

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white/90  rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6">
              <KnowledgeChunksTable />
            </div>
          </div>
        </motion.div>

        <KnowledgeChunkEditModal />
      </div>
      <AddNewKnowledgeChunkButton />
    </motion.div>
  );
}
