import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info" | "brand" | "outline";
}

export function Badge({ className, variant = "brand", children, ...props }: BadgeProps) {
  const variants = {
    brand: "bg-brand-light/15 text-brand-dark border-brand-light/30",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-sky-100 text-sky-800 border-sky-200",
    outline: "border border-slate-300 text-slate-700 bg-white",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
