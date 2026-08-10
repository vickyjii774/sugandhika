import React from "react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Home Banners</h1>
        <p className="text-xs text-slate-500">Manage hero banners and campaign graphics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-soft h-60 p-6 flex flex-col justify-end">
            <img src={b.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="relative z-10 space-y-1">
              <h4 className="font-extrabold text-lg font-serif">{b.title}</h4>
              <p className="text-xs text-slate-200">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
