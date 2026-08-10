import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, MapPin, User, ArrowRight, Package } from "lucide-react";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const orders = await getUserOrders(userId);
  const totalSpent = orders.reduce((sum, o) => sum + o.finalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 bg-gradient-to-r from-brand-dark to-brand-hover text-white rounded-3xl shadow-lg">
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-light uppercase tracking-wider block">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xs text-slate-200">{session.user.email}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/customer/orders">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20">
              View All Orders
            </button>
          </Link>
          <Link href="/customer/profile">
            <button className="px-4 py-2 bg-white text-brand-dark rounded-xl text-xs font-bold transition-all shadow-sm">
              Edit Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="p-4 rounded-xl bg-brand-cream text-brand-dark">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900">{orders.length}</h4>
            <p className="text-xs text-slate-500 font-medium">Total Orders Placed</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900">
              {orders.filter((o) => o.orderStatus === "DELIVERED").length}
            </h4>
            <p className="text-xs text-slate-500 font-medium">Delivered Packages</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="p-4 rounded-xl bg-brand-light/20 text-brand-dark">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalSpent)}</h4>
            <p className="text-xs text-slate-500 font-medium">Total Order Amount</p>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900 font-serif">Recent Orders</h3>
          <Link href="/customer/orders" className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 font-mono">{order.orderNumber}</span>
                    <Badge variant={order.orderStatus === "DELIVERED" ? "success" : "brand"}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(order.createdAt)} • {order.items.length} items
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-slate-900">{formatCurrency(order.finalAmount)}</span>
                  <Link
                    href={`/order-success/${order.id}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
