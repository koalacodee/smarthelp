"use client";
import { motion } from "framer-motion";
import { useCurrentEditingFAQStore } from "../store/useCurrentEditingFAQ";

export default function AddNewFaqButton() {
  const { setIsEditing, setFaq } = useCurrentEditingFAQStore();

  const handleAddNew = () => {
    setIsEditing(true);
    setFaq(null); // Clear any existing FAQ to create a new one
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.3)",
          transition: { duration: 0.2 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddNew}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
      >
        <motion.svg
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </motion.svg>
        Add New FAQ
      </motion.button>
    </div>
  );
}
