"use client";
import React, { useEffect, useState } from "react";
import api, { UserResponse } from "@/lib/api";
import { FileHubProfilePictureService } from "@/lib/api/v2";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { isRTL } from "@/locales/isRTL";

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
  const language = useLocaleStore((state) => state.language);
  const rtl = isRTL(language || "en");
  useEffect(() => {
    fetch("/server/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (user && user.profilePicture) {
        const profilePictureUrl =
          await FileHubProfilePictureService.getMyProfilePicture().then(
            (data) => data.signedUrl
          );
        setProfilePic(profilePictureUrl);
      }
    };
    fetchProfilePic();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className={`p-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      <div
        className={`flex items-center ${
          rtl ? "flex-row-reverse justify-end" : ""
        } ${rtl ? "space-x-reverse space-x-3" : "space-x-3"}`}
      >
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
        <div
          className={`flex flex-col space-y-1 min-w-0 flex-1 ${
            rtl ? "text-right" : "text-left"
          }`}
        >
          {/* Name and Role Badge in a row */}
          <div
            className={`flex items-center ${
              rtl ? "flex-row-reverse justify-end space-x-reverse" : ""
            } space-x-2`}
          >
            <span className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.role === "ADMIN"
              ? user.jobTitle && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {user.jobTitle}
                  </span>
                )
              : (() => {
                  const departments = user.departmentNames ?? [];
                  const maxVisible = 2;
                  const extraCount = departments.length - maxVisible;

                  return (
                    <div className="">
                      {departments.slice(0, maxVisible).map((dept, idx) => (
                        <span
                          key={dept + idx}
                          className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                        >
                          {dept}
                        </span>
                      ))}
                      {extraCount > 0 && (
                        <span className="inline-block bg-green-200 text-green-900 text-xs font-semibold px-2.5 py-0.5 rounded">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  );
                })()}
          </div>
        </div>
      </div>
    </div>
  );
}
