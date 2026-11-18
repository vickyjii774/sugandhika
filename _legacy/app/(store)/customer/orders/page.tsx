import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const orders = await getUserOrders(userId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">My Order History</h1>
        <p className="text-xs text-slate-500 mt-1">Track status and review past purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-soft text-slate-500 text-xs">
          No orders found. Explore our shop catalog to place your first order.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-900 font-mono">{order.orderNumber}</span>
                    <Badge variant={order.orderStatus === "DELIVERED" ? "success" : "brand"}>
                      {order.orderStatus}
                    </Badge>
                    <Badge variant={order.paymentStatus === "VERIFIED" ? "success" : "warning"}>
                      Payment: {order.paymentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Placed on {formatDate(order.createdAt)} • Payment Method: {order.paymentMethod}</p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-extrabold text-brand-dark">{formatCurrency(order.finalAmount)}</span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <span className="font-bold text-slate-800">{item.title} x {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  href={`/order-success/${order.id}`}
                  className="px-4 py-2 bg-brand-cream text-brand-dark hover:bg-brand-light hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  View Receipt
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
