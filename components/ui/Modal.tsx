"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  // Make sure document exists before using portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close with Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) {
    return null;
  }

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto "
      onClick={onClose}
    >
      {/* Full-screen backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal positioning */}
      <div className="relative z-10 flex min-h-full items-start justify-center p-4 sm:p-6">
        <div
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-2xl",
            "border border-slate-100",
            "my-4 sm:my-8",
            maxWidths[maxWidth]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {title}
              </h3>

              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Render OUTSIDE the parent container
  return createPortal(modal, document.body);
}