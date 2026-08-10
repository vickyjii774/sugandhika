import React from "react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, reviews: true } },
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Customer Directory</h1>
        <p className="text-xs text-slate-500">Registered users, accounts and order activity</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{c.name}</td>
                  <td className="p-4 text-slate-600">{c.email}</td>
                  <td className="p-4">{c.phone || "N/A"}</td>
                  <td className="p-4">
                    <Badge variant={c.role === "ADMIN" ? "brand" : "outline"}>
                      {c.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-bold">{c._count.orders} orders</td>
                  <td className="p-4">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
