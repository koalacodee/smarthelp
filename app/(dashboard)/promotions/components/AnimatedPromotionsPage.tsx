"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { usePromotionsStore } from "../store/usePromotionsStore";
import { PromotionDTO } from "@/lib/api/v2/services/promotion";
import PromotionEditModal from "./PromotionEditModal";
import PromotionsTable from "./PromotionsTable";
import PromotionFilters from "./PromotionFilters";
import AnimatedPromotionsHeader from "./AnimatedPromotionsHeader";
import AddNewPromotionButton from "./AddNewPromotionButton";

interface AnimatedPromotionsPageProps {
  promotions: PromotionDTO[];
  attachments: Record<string, string[]>;
}

export default function AnimatedPromotionsPage({
  promotions,
  attachments,
}: AnimatedPromotionsPageProps) {
  const { setPromotions } = usePromotionsStore();

  useEffect(() => {
    setPromotions(promotions);
  }, [promotions, setPromotions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <AnimatedPromotionsHeader />

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PromotionFilters />
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <PromotionsTable
              promotions={promotions}
              attachments={attachments}
            />
          </div>
        </motion.div>

        <PromotionEditModal />
      </div>
      <AddNewPromotionButton />
    </motion.div>
  );
}
