import React from "react";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./CategoryManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Categories Management</h1>
        <p className="text-xs text-slate-500">Organize store catalog into eco product lines</p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
