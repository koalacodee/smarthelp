"use client";

import React from "react";
import { motion } from "framer-motion";
import FaqEditModal from "./FaqEditModal";
import FaqsTable from "./FaqsTable";
import FaqsFilters from "./FaqsFilters";
import AnimatedFAQsHeader from "./AnimatedFAQsHeader";
import AddNewFaqButton from "./AddNewFaqButton";
import { GroupedFAQs } from "../page";

interface AnimatedFAQsPageProps {
  questions: GroupedFAQs[];
  attachments: Record<string, string[]>;
  fileHubAttachments?: Record<string, Record<string, string>>;
}

export default function AnimatedFAQsPage({
  questions,
  attachments,
  fileHubAttachments,
}: AnimatedFAQsPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <AnimatedFAQsHeader />

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaqsFilters />
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <FaqsTable
              questions={questions}
              attachments={attachments}
              fileHubAttachments={fileHubAttachments}
            />
          </div>
        </motion.div>

        <FaqEditModal />
      </div>
      <AddNewFaqButton />
    </motion.div>
  );
}
