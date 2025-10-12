"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import FilesTable from "./FilesTable";
import UploadModal from "./UploadModal";
import ShareModal from "./ShareModal";
import { Attachment } from "@/lib/api/v2/services/shared/upload";
import DocumentDuplicate from "@/icons/DocumentDuplicate";
import Plus from "@/icons/Plus";

interface AnimatedFilesPageProps {
  attachments: Attachment[];
  totalCount: number;
  hasMore: boolean;
}

export default function AnimatedFilesPage({
  attachments,
  totalCount,
  hasMore,
}: AnimatedFilesPageProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [shareModalAttachment, setShareModalAttachment] =
    useState<Attachment | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 relative overflow-hidden"
    >
      {/* Background Animation Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.7 }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.9 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-2xl"
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: "backOut",
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.3 },
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
            >
              <DocumentDuplicate className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: "easeOut",
              }}
              className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
            >
              My Files
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              Manage and preview your uploaded files and attachments
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Files
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-4 text-sm text-slate-500"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{totalCount} Total Files</span>
              </motion.div>
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>More available</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Files Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: "easeOut",
          }}
          whileHover={{
            y: -3,
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: "backOut" }}
                className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </motion.svg>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-xl font-bold text-slate-800 flex items-center gap-2"
              >
                Files & Attachments
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9, ease: "backOut" }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                >
                  {totalCount}
                </motion.span>
              </motion.h2>
            </motion.div>
            <FilesTable
              attachments={attachments}
              onShare={(attachment) => {
                setShareModalAttachment(attachment);
                setIsShareModalOpen(true);
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareModalAttachment(null);
        }}
        attachment={shareModalAttachment}
      />
    </motion.div>
  );
}
