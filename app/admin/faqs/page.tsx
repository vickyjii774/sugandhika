import React from "react";
import { prisma } from "@/lib/prisma";
import FAQManager from "./FAQManager";

export const revalidate = 0;

export default async function AdminFAQsPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <FAQManager faqs={faqs} />
    </div>
  );
}