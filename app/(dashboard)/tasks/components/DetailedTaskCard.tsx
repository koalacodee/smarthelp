import { useTaskDetailsStore } from "../store/useTaskDetailsStore";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";

export default function DetailedTaskCard() {
  const { isOpen, currentTask, closeDetails } = useTaskDetailsStore();

  if (!currentTask) return null;

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                  <h2 className="text-2xl font-bold text-foreground">{currentTask.title}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="text-foreground">{currentTask.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <p className="text-foreground">{currentTask.status}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                      <p className="text-foreground">{currentTask.priority}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                      <p className="text-foreground">
                        {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    
                    {currentTask.targetDepartment && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                        <p className="text-foreground">{currentTask.targetDepartment.name}</p>
                      </div>
                    )}
                    
                    {currentTask.targetSubDepartment && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Sub-Department</h3>
                        <p className="text-foreground">{currentTask.targetSubDepartment.name}</p>
                      </div>
                    )}
                    
                    {currentTask.assignee && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Assignee</h3>
                        <p className="text-foreground">{currentTask.assignee.user.name}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                      <p className="text-foreground">
                        {new Date(currentTask.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {currentTask.notes && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                        <p className="text-foreground">{currentTask.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={closeDetails}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                    >
                      Close
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
