"use client";

import { useState } from "react";
import RefreshCw from "@/icons/RefreshCw";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  className?: string;
  label?: string;
}

export default function RefreshButton({
  onRefresh,
  className = "",
  label,
}: RefreshButtonProps) {
  const locale = useLocaleStore((state) => state.locale);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const displayLabel = label || locale?.components?.refreshButton?.label || "Refresh";

  if (!locale) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
      aria-label={displayLabel}
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {displayLabel}
    </button>
  );
}
