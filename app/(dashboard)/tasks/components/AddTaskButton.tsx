"use client";
import Button from "@/components/ui/Button";
import { useTaskModalStore } from "../store/useTaskModalStore";

export default function AddTaskButton() {
  const setOpen = useTaskModalStore((state) => state.setOpen);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button onClick={() => setOpen(true)}>Add New Task</Button>
    </div>
  );
}
