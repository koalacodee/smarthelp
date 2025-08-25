import { create } from "zustand";
import { Ticket } from "@/lib/api";

interface CurrentEditingTicketState {
  ticket: Ticket | null;
  isEditing: boolean;
  setTicket: (ticket: Ticket | null) => void;
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
