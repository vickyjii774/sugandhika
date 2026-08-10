import React from "react";
import { prisma } from "@/lib/prisma";
import { OrderManager } from "./OrderManager";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      payment: true,
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Orders & Fonepay Verifications</h1>
        <p className="text-xs text-slate-500">Manage fulfillment, verify Fonepay screenshots, and update status</p>
      </div>

      <OrderManager orders={orders as any} />
    </div>
  );
}
