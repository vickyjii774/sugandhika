"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Leaf } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartSubtotal } = useCart();

  const shippingFee = cartSubtotal >= 1500 || cartSubtotal === 0 ? 0 : 100;
  const grandTotal = cartSubtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-cream text-brand-dark flex items-center justify-center mx-auto shadow-soft">
          <ShoppingBag className="w-10 h-10 text-brand-light" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Look like you haven't added any eco-friendly mosquito repellent sticks or room mists to your cart yet.
        </p>
        <Link href="/shop" className="inline-block">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review items before proceeding to checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.productId} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <Link href={`/shop/${item.slug}`} className="text-sm font-bold text-slate-900 hover:text-brand-dark">
                        {item.name}
                      </Link>
                      <p className="text-xs font-bold text-brand-dark">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-extrabold text-slate-900 min-w-[80px] text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? <span className="text-brand-dark font-bold">FREE</span> : formatCurrency(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[11px] text-brand-dark bg-brand-cream p-2 rounded-xl border border-brand-light/30">
                  Add {formatCurrency(1500 - cartSubtotal)} more for FREE shipping!
                </p>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total</span>
                <span className="text-brand-dark">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button variant="primary" size="lg" className="w-full">
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-dark" /> Cash on Delivery & Fonepay QR Supported
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-brand-dark" /> 100% Eco-Friendly Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
