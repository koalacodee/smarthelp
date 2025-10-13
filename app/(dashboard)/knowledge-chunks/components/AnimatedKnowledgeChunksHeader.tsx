"use client";

import { motion } from "framer-motion";
import RefreshButton from "@/components/ui/RefreshButton";
import { useKnowledgeChunksStore } from "../store/useKnowledgeChunksStore";
import { KnowledgeChunksService } from "@/lib/api";
import BookOpen from "@/icons/BookOpen";

export default function AnimatedKnowledgeChunksHeader() {
  const { setChunks } = useKnowledgeChunksStore();

  async function refreshChunks() {
    try {
      const response = await KnowledgeChunksService.getAllKnowledgeChunks();
      const chunks = response.knowledgeChunks || [];

      // Group chunks by department
      const groupedMap = new Map<string, any>();

      chunks.forEach((chunk) => {
        const dept = chunk.department;
        if (dept) {
          const key = dept.id;
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              departmentId: key,
              departmentName: dept.name,
              chunks: [],
            });
          }
          groupedMap.get(key)!.chunks.push(chunk);
        }
      });

      setChunks(Array.from(groupedMap.values()));
      return true;
    } catch (error) {
      console.error("Error loading knowledge chunks:", error);
      return false;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full"
        >
          <BookOpen className="h-8 w-8 text-white" />
        </motion.div>
      </div>

      <div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent"
        >
          Knowledge Chunks
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-slate-600 mt-2 max-w-2xl mx-auto"
        >
          Manage your knowledge base content for better customer support and
          information retrieval
        </motion.p>
      </div>
    </motion.div>
  );
}
