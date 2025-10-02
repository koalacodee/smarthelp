"use client";
import { motion } from "framer-motion";

export default function TeamTasksDashboard({
  total,
  completedCount,
  pendingCount,
  completionPercentage,
}: {
  total: number;
  completedCount: number;
  pendingCount: number;
  completionPercentage: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-base font-semibold mb-4 text-[#4a5568]"
      >
        Team Dashboard
      </motion.h3>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative`}
        style={{
          background: `conic-gradient(
      #3b82f6 0deg ${completionPercentage * 3.6}deg, 
      #e2e8f0 ${completionPercentage * 3.6}deg 360deg
    )`,
        }}
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-lg font-bold bg-white rounded-full w-16 h-16 flex items-center justify-center"
        >
          {completionPercentage}%
        </motion.span>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="list-none"
      >
        {[
          {
            icon: "📋",
            label: "Total Tasks",
            value: total,
            color: "text-[#667eea]",
          },
          {
            icon: "✅",
            label: "Completed",
            value: completedCount,
            color: "text-[#48bb78]",
          },
          {
            icon: "🟡",
            label: "In Progress",
            value: pendingCount,
            color: "text-[#f59e0b]",
          },
        ].map((item, index) => (
          <motion.li
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
            className={`flex justify-between py-2.5 ${
              index < 2 ? "border-b border-[#e2e8f0]" : ""
            } text-sm`}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.6 + index * 0.1,
                  ease: "backOut",
                }}
                className="mr-1.5"
              >
                {item.icon}
              </motion.span>
              {item.label}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className={item.color}
            >
              {item.value}
            </motion.span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
