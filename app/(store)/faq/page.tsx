import React from "react";
import { prisma } from "@/lib/prisma";
import { ChevronRight, HelpCircle } from "lucide-react";

export const revalidate = 60;

export default async function FAQPage() {
  let faqs: any[] = [];
  try {
    faqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    faqs = [];
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-cream text-brand-dark flex items-center justify-center mx-auto shadow-soft">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Frequently Asked Questions</h1>
        <p className="text-xs text-slate-500">Find answers to common questions about product safety, delivery, and payments.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-soft transition-all"
          >
            <summary className="font-bold text-sm text-slate-800 cursor-pointer flex items-center justify-between list-none">
              <span>{faq.question}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
