"use client";
import { useCurrentEditingFAQStore } from "../store/useCurrentEditingFAQ";

export default function AddNewFaqButton() {
  const { setIsEditing, setFaq } = useCurrentEditingFAQStore();

  const handleAddNew = () => {
    setIsEditing(true);
    setFaq(null); // Clear any existing FAQ to create a new one
  };

  return (
    <button
      onClick={handleAddNew}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer hover:bg-blue-700"
    >
      Add New FAQ
    </button>
  );
}
