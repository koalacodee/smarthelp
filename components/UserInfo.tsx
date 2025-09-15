"use client";
import React from "react";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";

interface UserInfoProps {
  className?: string;
}

const getRoleBadgeStyles = (role: string) => {
  const baseStyles =
    "px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide";

  switch (role) {
    case "ADMIN":
      return `${baseStyles} bg-red-100 text-red-800 border border-red-200`;
    case "SUPERVISOR":
      return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`;
    case "EMPLOYEE":
      return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
    default:
      return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`;
  }
};

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export default function UserInfo({ className = "" }: UserInfoProps) {
  const { user } = useUserStore();

  if (!user) {
    return null;
  }

  return (
    <div className={`p-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex flex-col space-y-2">
        {/* Name and Role Badge in a row */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </span>
          <span className={getRoleBadgeStyles(user.role)}>
            {formatRole(user.role)}
          </span>
        </div>
        {/* User Email below */}
        <div className="text-xs text-gray-500 truncate">{user.email}</div>
      </div>
    </div>
  );
}
