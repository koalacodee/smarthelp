"use client";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";
import api from "@/lib/api";

export default function InitializeUser() {
  const { initialized, setUser } = useUserStore();

  if (!initialized) {
    api.authService.getCurrentUser().then((user) => {
      setUser(user);
    });
  }

  return null;
}
