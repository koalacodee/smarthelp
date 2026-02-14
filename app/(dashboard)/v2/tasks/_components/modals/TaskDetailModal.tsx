"use client";

import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import ModalShell from "./ModalShell";
import StatusBadge from "../StatusBadge";
import PriorityBadge from "../PriorityBadge";
import ExistingAttachmentsViewer from "@/app/(dashboard)/files/components/ExistingAttachmentsViewer";
import { formatDateTimeWithHijri } from "@/locales/dateFormatter";
import type { TaskResponse } from "@/services/tasks/types";

export default function TaskDetailModal() {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const { activeModal, modalPayload, closeModal } = useV2TaskPageStore();

  const task = modalPayload as TaskResponse | null;
  const isOpen = activeModal === "task-detail" && !!task;

  if (!locale || !task)
    return (
      <ModalShell isOpen={false} onClose={closeModal}>
        <div />
      </ModalShell>
    );

  return (
    <ModalShell isOpen={isOpen} onClose={closeModal} size="lg">
      <div className="space-y-4">
        <DialogTitle as="h2" className="text-2xl font-bold text-foreground">
          {task.title}
        </DialogTitle>
        <p className="text-foreground">{task.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <StatusBadge status={task.status} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {locale.tasks.details.labels.priority ?? "Priority"}
            </p>
            <PriorityBadge priority={task.priority} />
          </div>
          {task.dueDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {locale.tasks.details.labels.dueDate ?? "Due Date"}
              </p>
              <p className="text-foreground">
                {formatDateTimeWithHijri(
                  task.dueDate,
                  language ?? "en",
                  { month: "short", day: "numeric", year: "numeric" },
                  { hour: "numeric", minute: "2-digit", hour12: true },
                )}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p className="text-foreground">
              {formatDateTimeWithHijri(
                task.createdAt,
                language ?? "en",
                { month: "short", day: "numeric", year: "numeric" },
                { hour: "numeric", minute: "2-digit", hour12: true },
              )}
            </p>
          </div>
        </div>
        {task.reminders && task.reminders.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {locale.tasks.details.labels.reminders ?? "Reminders"}
            </p>
            <div className="space-y-2">
              {task.reminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground">
                    {formatDateTimeWithHijri(
                      r.reminderDate,
                      language ?? "en",
                      { month: "short", day: "numeric" },
                      { hour: "numeric", minute: "2-digit", hour12: true },
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <ExistingAttachmentsViewer targetId={task.id} />
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            {locale.tasks.details.buttons.close ?? "Close"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
