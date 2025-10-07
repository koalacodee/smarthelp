"use client";
import React, { useEffect, useState } from "react";
import api, { UserResponse } from "@/lib/api";

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
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profilePic, setProfilePic] = useState("");
  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePic(
        `${api.client.defaults.baseURL}/profile/pictures/${user.profilePicture}`
      );
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className={`p-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {profilePic ? (
            <img
              src={profilePic}
              alt={`${user.name}'s profile`}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200">
              <span className="text-gray-600 text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col space-y-1 min-w-0 flex-1">
          {/* Name and Role Badge in a row */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </span>
          </div>
          {/* User Email below */}
          <div className="text-xs text-gray-500 truncate">
            {user?.jobTitle || "No job title"}
          </div>
        </div>
      </div>
    </div>
  );
}
