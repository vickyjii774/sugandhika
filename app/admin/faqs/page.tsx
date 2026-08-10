import React from "react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminFAQsPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">FAQs Management</h1>
        <p className="text-xs text-slate-500">Frequently Asked Questions shown on store & home page</p>
      </div>

      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-2">
            <h4 className="font-bold text-sm text-slate-900">{f.question}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
