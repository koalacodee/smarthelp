import { useTaskDetailsStore } from "../store/useTaskDetailsStore";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import ExistingAttachmentsViewer from "../../files/components/ExistingAttachmentsViewer";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

// Helper function to convert milliseconds to readable format
const formatReminderInterval = (
  milliseconds?: number,
  locale?: any
): string => {
  if (!milliseconds || milliseconds <= 0 || !locale) return "";

  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0)
    parts.push(
      `${days} ${
        days !== 1
          ? locale.tasks.modals.addTask.fields.days
          : locale.tasks.modals.addTask.fields.days
      }`
    );
  if (hours > 0)
    parts.push(
      `${hours} ${
        hours !== 1
          ? locale.tasks.modals.addTask.fields.hours
          : locale.tasks.modals.addTask.fields.hours
      }`
    );
  if (minutes > 0)
    parts.push(
      `${minutes} ${
        minutes !== 1
          ? locale.tasks.modals.addTask.fields.minutes
          : locale.tasks.modals.addTask.fields.minutes
      }`
    );

  return parts.length > 0 ? parts.join(", ") : "";
};

export default function DetailedTaskCard() {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
  const { isOpen, currentTask, closeDetails } = useTaskDetailsStore();

  if (!currentTask || !locale) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={closeDetails}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 " />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentTask.title}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {locale.tasks.modals.addTask.fields.description}
                      </h3>
                      <p className="text-foreground">
                        {currentTask.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {locale.tasks.teamTasks.filters.status.label}
                      </h3>
                      <p className="text-foreground">{currentTask.status}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {locale.tasks.modals.addTask.fields.priority}
                      </h3>
                      <p className="text-foreground">
                        {currentTask.priority === "HIGH"
                          ? locale.tasks.modals.addTask.priorityOptions.high
                          : currentTask.priority === "MEDIUM"
                          ? locale.tasks.modals.addTask.priorityOptions.medium
                          : locale.tasks.modals.addTask.priorityOptions.low}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {locale.tasks.modals.addTask.fields.dueDate}
                      </h3>
                      <p className="text-foreground">
                        {currentTask.dueDate
                          ? formatDateWithHijri(currentTask.dueDate, language)
                          : locale.tasks.teamTasks.card.noDueDate}
                      </p>
                    </div>

                    {currentTask.reminderInterval && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {locale.tasks.modals.addTask.fields.reminder}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {locale.tasks.teamTasks.card.every}{" "}
                          {formatReminderInterval(
                            currentTask.reminderInterval,
                            locale
                          )}
                        </p>
                      </div>
                    )}

                    {currentTask.targetDepartment && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {locale.tasks.modals.addTask.fields.department}
                        </h3>
                        <p className="text-foreground">
                          {currentTask.targetDepartment.name}
                        </p>
                      </div>
                    )}

                    {currentTask.targetSubDepartment && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {locale.tasks.modals.addTask.fields.subDepartment}
                        </h3>
                        <p className="text-foreground">
                          {currentTask.targetSubDepartment.name}
                        </p>
                      </div>
                    )}

                    {currentTask.assignee && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {locale.tasks.modals.addTask.fields.assignee}
                        </h3>
                        <p className="text-foreground">
                          {currentTask.assignee.user.name}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {locale.tasks.teamTasks.card.createdAt}
                      </h3>
                      <p className="text-foreground">
                        {new Date(currentTask.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {currentTask.notes && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {locale.tasks.teamTasks.card.notes}
                        </h3>
                        <p className="text-foreground">{currentTask.notes}</p>
                      </div>
                    )}

                    <ExistingAttachmentsViewer targetId={currentTask.id} />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={closeDetails}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                    >
                      {locale.tasks.modals.editTask.buttons.cancel}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
