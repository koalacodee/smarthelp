import api from "@/lib/api";
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface UserStore {
  user: User | null;
  initialized: boolean;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  initialized: false,
  setUser: (user: User) => {
    set({ user, initialized: true });
  },
}));

// Cu
