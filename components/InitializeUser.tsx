"use client";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";
import api from "@/lib/api";
import Cookies from "js-cookie";

export default function InitializeUser() {
  const { initialized, setUser } = useUserStore();

  if (!initialized) {
    api.authService.getCurrentUser().then((user) => {
      setUser(user);
      Cookies.set("user-role", user.role);
    });
  }

  return null;
}
