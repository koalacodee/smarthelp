import { create } from "zustand";
import { SupportTicket } from "@/lib/api";

interface CurrentEditingTicketState {
  ticket: SupportTicket | null;
  isEditing: boolean;
  setTicket: (ticket: SupportTicket | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useCurrentEditingTicketStore = create<CurrentEditingTicketState>(
  (set) => ({
    ticket: null,
    isEditing: false,
    setTicket: (ticket) => set({ ticket }),
    setIsEditing: (isEditing) => set({ isEditing }),
  })
);
