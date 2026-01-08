"use client";

import { useEffect } from "react";
import XMarkIcon from "@/icons/XCircle";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 hover:rotate-90 transition-all duration-200"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
