import { create } from "zustand";
import type { AttachmentGroupSummary } from "@/lib/api/v2/services/filehub-attachment-groups";

interface AttachmentGroupsStore {
  attachmentGroups: AttachmentGroupSummary[];
  setAttachmentGroups: (groups: AttachmentGroupSummary[]) => void;
  addAttachmentGroup: (group: AttachmentGroupSummary) => void;
  updateAttachmentGroup: (
    id: string,
    group: Partial<AttachmentGroupSummary>
  ) => void;
  removeAttachmentGroup: (id: string) => void;
  getAttachmentGroupById: (id: string) => AttachmentGroupSummary | undefined;
}

export const useAttachmentGroupsStore = create<AttachmentGroupsStore>(
  (set, get) => ({
    attachmentGroups: [],

    setAttachmentGroups: (groups) => set({ attachmentGroups: groups }),

    addAttachmentGroup: (group) =>
      set((state) => ({
        attachmentGroups: [...state.attachmentGroups, group],
      })),

    updateAttachmentGroup: (id, updatedGroup) =>
      set((state) => ({
        attachmentGroups: state.attachmentGroups.map((group) =>
          group.id === id ? { ...group, ...updatedGroup } : group
        ),
      })),

    removeAttachmentGroup: (id) =>
      set((state) => ({
        attachmentGroups: state.attachmentGroups.filter(
          (group) => group.id !== id
        ),
      })),

    getAttachmentGroupById: (id) => {
      return get().attachmentGroups.find((group) => group.id === id);
    },
  })
);
