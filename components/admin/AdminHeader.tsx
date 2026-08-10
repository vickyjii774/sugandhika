"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { User, Bell } from "lucide-react";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-700">Sugandhika Management Live</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-brand-dark text-white flex items-center justify-center font-bold text-xs">
            {session?.user?.name?.[0] || "A"}
          </div>
          <div className="text-left hidden sm:block">
            <h4 className="text-xs font-bold text-slate-800">{session?.user?.name || "Administrator"}</h4>
            <span className="text-[10px] text-brand-dark font-semibold">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
