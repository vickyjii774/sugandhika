"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { orderApi } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

export default function OrderSuccessClient({ orderNumber, initialOrder = null }) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialOrder) return;

    let isMounted = true;
    async function fetchOrder() {
      try {
        const data = await orderApi.getOrder(orderNumber);
        if (isMounted && data) {
          setOrder(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Could not retrieve order details from the server.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderNumber, initialOrder]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-dark mx-auto" />
        <p className="text-sm font-medium text-slate-600">Retrieving order details...</p>
      </div>
    );
  }

  // If order could not be loaded, still show a friendly confirmation with the reference ID
  const displayOrderNumber = order?.order_number || order?.orderNumber || orderNumber;
  const createdAt = order?.created_at || order?.createdAt || new Date().toISOString();
  const orderStatus = order?.status || order?.orderStatus || "PENDING";
  const paymentStatus = order?.payment_status || order?.paymentStatus || "PENDING";
  const items = order?.items || [];
  const subtotal = parseFloat(order?.subtotal || order?.totalAmount || 0);
  const discountAmount = parseFloat(order?.discount_amount || order?.discountAmount || 0);
  const shippingFee = parseFloat(order?.shipping_fee || order?.shippingFee || 0);
  const totalAmount = parseFloat(order?.total_amount || order?.finalAmount || subtotal - discountAmount + shippingFee);

  // Address parsing
  let shippingAddr = order?.shipping_address || null;
  if (typeof shippingAddr === "string") {
    try {
      shippingAddr = JSON.parse(shippingAddr);
    } catch {
      shippingAddr = null;
    }
  }

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
          Order Reference: <strong className="text-white font-mono">{displayOrderNumber}</strong>. We are processing your organic products for immediate dispatch.
        </p>
      </div>

      {/* Order Summary Details */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">Order Details</h3>
            <p className="text-xs text-slate-500">Placed on {formatDate(createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">{orderStatus}</Badge>
            <Badge variant={paymentStatus === "VERIFIED" ? "success" : "warning"}>
              Payment: {paymentStatus}
            </Badge>
          </div>
        </div>

        {/* Purchased Items */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h4>
            <div className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const name = item.product_name || item.title || `Item #${idx + 1}`;
                const price = parseFloat(item.unit_price || item.price || 0);
                const qty = item.quantity || 1;
                const img = item.image_url || item.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80";

                return (
                  <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={img}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50"
                      />
                      <div>
                        <h5 className="font-bold text-slate-900">{name}</h5>
                        <p className="text-slate-500">
                          Qty: {qty} × {formatCurrency(price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatCurrency(price * qty)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing Summary & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Delivery Address</h4>
            {shippingAddr ? (
              <div className="text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">{shippingAddr.full_name || shippingAddr.fullName}</p>
                <p>{shippingAddr.street}, {shippingAddr.city}</p>
                <p>{shippingAddr.state}, {shippingAddr.postal_code || shippingAddr.postalCode}</p>
                <p>Phone: {shippingAddr.phone}</p>
              </div>
            ) : (
              <p className="text-slate-500">Shipping to the address provided during checkout.</p>
            )}
          </div>

          <div className="space-y-2 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 font-mono">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900 font-mono">{formatCurrency(shippingFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Paid / Payable</span>
              <span className="text-brand-dark font-mono">{formatCurrency(totalAmount)}</span>
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
