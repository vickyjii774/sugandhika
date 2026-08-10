import React from "react";
import { prisma } from "@/lib/prisma";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Customer Reviews Moderation</h1>
        <p className="text-xs text-slate-500">Monitor and approve customer product feedback</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">{r.user.name}</td>
                  <td className="p-4 font-semibold text-slate-800">{r.product.name}</td>
                  <td className="p-4">
                    <RatingStars rating={r.rating} size="sm" />
                  </td>
                  <td className="p-4 max-w-xs truncate italic text-slate-600">"{r.comment}"</td>
                  <td className="p-4">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
