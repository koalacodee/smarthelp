"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LogoutIcon from "@/icons/Logout";
import api from "@/lib/api";
import { usePathname } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await api.authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {pathname !== "/login" && (
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title="Logout"
        >
          <LogoutIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      )}
    </>
  );
};

export default LogoutButton;
