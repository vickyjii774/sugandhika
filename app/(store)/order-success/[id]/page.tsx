import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderDetails } from "@/lib/actions/order.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";

interface OrderSuccessProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    notFound();
  }

  const shippingAddr = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="p-8 bg-gradient-to-br from-brand-dark to-brand-hover text-white rounded-3xl shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-brand-light" />
        </div>
        <span className="px-3 py-1 rounded-full bg-brand-light/30 text-brand-light text-xs font-bold uppercase tracking-widest inline-block">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">Thank You For Your Order!</h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-md mx-auto leading-relaxed">
          Order Reference: <strong className="text-white font-mono">{order.orderNumber}</strong>. We are processing your organic products for immediate dispatch.
        </p>
      </div>

      {/* Order Summary Details */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">Order Details</h3>
            <p className="text-xs text-slate-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">{order.orderStatus}</Badge>
            <Badge variant={order.paymentStatus === "VERIFIED" ? "success" : "warning"}>
              Payment: {order.paymentStatus}
            </Badge>
          </div>
        </div>

        {/* Purchased Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h4>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{item.title}</h5>
                    <p className="text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Delivery Address</h4>
            {shippingAddr && (
              <div className="text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">{shippingAddr.fullName}</p>
                <p>{shippingAddr.street}, {shippingAddr.city}</p>
                <p>{shippingAddr.state}, {shippingAddr.postalCode}</p>
                <p>Phone: {shippingAddr.phone}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900">{formatCurrency(order.shippingFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Paid / Payable</span>
              <span className="text-brand-dark">{formatCurrency(order.finalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Link href="/customer/orders">
          <Button variant="outline">
            <ShoppingBag className="w-4 h-4 mr-2" /> View My Orders
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="primary">
            Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
