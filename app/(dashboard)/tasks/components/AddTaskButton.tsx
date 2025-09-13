"use client";
import Button from "@/components/ui/Button";
import { useTaskModalStore } from "../store/useTaskModalStore";

export default function AddTaskButton() {
  const setOpen = useTaskModalStore((state) => state.setOpen);
  return <Button onClick={() => setOpen(true)}>Add New Task</Button>;
}
