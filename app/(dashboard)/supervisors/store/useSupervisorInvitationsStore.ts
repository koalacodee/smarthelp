import { create } from "zustand";
import { SupervisorInvitationStatus } from "@/lib/api/v2/services/supervisor";

interface SupervisorInvitationsState {
  invitations: SupervisorInvitationStatus[];
  addInvitation: (invitation: SupervisorInvitationStatus) => void;
  updateInvitation: (
    id: string,
    invitation: SupervisorInvitationStatus
  ) => void;
  removeInvitation: (id: string) => void;
  setInvitations: (invitations: SupervisorInvitationStatus[]) => void;
}

export const useSupervisorInvitationsStore = create<SupervisorInvitationsState>(
  (set) => ({
    invitations: [],
    addInvitation: (invitation) =>
      set((state) => ({
        invitations: [...state.invitations, invitation],
      })),
    updateInvitation: (id, invitation) =>
      set((state) => ({
        invitations: state.invitations.map((inv) =>
          inv.token === id ? invitation : inv
        ),
      })),
    removeInvitation: (id) =>
      set((state) => ({
        invitations: state.invitations.filter((inv) => inv.token !== id),
      })),
    setInvitations: (invitations) => set({ invitations }),
  })
);
