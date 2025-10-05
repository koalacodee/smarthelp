"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InfoCircle from "@/icons/InfoCircle";

interface InfoTooltipProps {
  content: string | React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  maxWidth?: string;
  minWidth?: string;
  className?: string;
  iconClassName?: string;
  delay?: number;
}

export default function InfoTooltip({
  content,
  position = "top",
  maxWidth = "300px",
  minWidth = "300px",
  className = "",
  iconClassName = "",
  delay = 300,
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const getTooltipPosition = () => {
    const baseClasses =
      "absolute z-50 px-4 py-2 text-xs text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700";

    switch (position) {
      case "top":
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case "bottom":
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case "left":
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case "right":
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const baseArrow =
      "absolute w-2 h-2 bg-slate-900 border border-slate-700 transform rotate-45";

    switch (position) {
      case "top":
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -mt-1`;
      case "bottom":
        return `${baseArrow} bottom-full left-1/2 transform -translate-x-1/2 -mb-1`;
      case "left":
        return `${baseArrow} left-full top-1/2 transform -translate-y-1/2 -ml-1`;
      case "right":
        return `${baseArrow} right-full top-1/2 transform -translate-y-1/2 -mr-1`;
      default:
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -mt-1`;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        ref={iconRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`cursor-help transition-colors duration-200 ${
          isVisible ? "text-blue-500" : "text-slate-400 hover:text-slate-600"
        } ${iconClassName}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        tabIndex={0}
        role="button"
        aria-label="Show information"
      >
        <InfoCircle className="w-4 h-4" />
      </motion.div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{
              opacity: 0,
              scale: 0.8,
              y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={getTooltipPosition()}
            style={{ maxWidth, minWidth }}
          >
            <div className="relative">
              {typeof content === "string" ? (
                <div className="whitespace-normal break-words">{content}</div>
              ) : (
                content
              )}
              <div className={getArrowClasses()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
