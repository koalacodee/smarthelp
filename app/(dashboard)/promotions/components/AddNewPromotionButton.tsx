"use client";

import { motion } from "framer-motion";
import { useCurrentEditingPromotionStore } from "../store/useCurrentEditingPromotion";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function AddNewPromotionButton() {
  const { setPromotion, setIsEditing } = useCurrentEditingPromotionStore();
  const { locale } = useLocaleStore();

  const handleAddNew = () => {
    setPromotion(null); // null means we're creating a new promotion
    setIsEditing(true);
  };

  if (!locale) return null;

  return (
    <div className="fixed bottom-6 right-6 z-10">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 8px 25px -5px rgba(147, 51, 234, 0.4)",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddNew}
        className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
      >
        <span className="relative z-10 flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </motion.div>
          {locale.promotions.addButton}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={false}
        />
      </motion.button>
    </div>
  );
}
