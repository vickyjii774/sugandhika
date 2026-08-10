import React from "react";
import { prisma } from "@/lib/prisma";
import { RatingStars } from "@/components/ui/RatingStars";

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Customer Testimonials</h1>
        <p className="text-xs text-slate-500">Manage social proof testimonials shown on homepage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-3">
            <RatingStars rating={t.rating} size="sm" />
            <p className="text-xs text-slate-600 italic">"{t.content}"</p>
            <div className="pt-2 border-t border-slate-100">
              <h5 className="font-bold text-xs text-slate-900">{t.name}</h5>
              <p className="text-[10px] text-slate-400">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
