import React from "react";
import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/actions/admin.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { RevenueChart } from "@/components/admin/RevenueChart";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const revalidate = 0; // Fresh dashboard metrics

export default async function AdminDashboardPage() {
  const {
    totalRevenue,
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCustomers,
    chartData,
    recentOrders,
  } = await getAdminDashboardStats();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Admin Overview</h1>
        <p className="text-xs text-slate-500">Live operational metrics & revenue report</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
            <h3 className="text-xl font-extrabold text-slate-900">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-brand-cream text-brand-dark">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <h3 className="text-xl font-extrabold text-slate-900">{totalOrders}</h3>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Orders</span>
            <h3 className="text-xl font-extrabold text-amber-700">{pendingOrders}</h3>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-sky-50 text-sky-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
            <h3 className="text-xl font-extrabold text-slate-900">{totalCustomers}</h3>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-dark" /> Monthly Sales Trend
          </h3>
          <span className="text-xs font-semibold text-slate-500">Currency: NPR (Rs.)</span>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {/* Recent Orders Datatable */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
          <Link href="/admin/orders" className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
            Manage All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Order Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 font-mono">{ord.orderNumber}</td>
                  <td className="p-3">{ord.user.name}</td>
                  <td className="p-3 font-semibold">{ord.paymentMethod}</td>
                  <td className="p-3 font-extrabold text-slate-900">{formatCurrency(ord.finalAmount)}</td>
                  <td className="p-3">
                    <Badge variant={ord.orderStatus === "DELIVERED" ? "success" : "brand"}>
                      {ord.orderStatus}
                    </Badge>
                  </td>
                  <td className="p-3">{formatDate(ord.createdAt)}</td>
                  <td className="p-3 text-right">
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1 bg-brand-cream text-brand-dark hover:bg-brand-dark hover:text-white rounded-lg font-bold transition-all inline-block"
                    >
                      View & Verify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
