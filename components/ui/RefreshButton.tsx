"use client";

import { useState } from "react";
import RefreshCw from "@/icons/RefreshCw";

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  className?: string;
  label?: string;
}

export default function RefreshButton({
  onRefresh,
  className = "",
  label = "Refresh",
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      aria-label={label}
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}
