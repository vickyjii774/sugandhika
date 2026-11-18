"use client";

import React from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-brand-cream/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-dark" />
              <h2 className="text-lg font-bold text-slate-800">Your Shopping Cart</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-brand-cream text-brand-dark flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-brand-light" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explore our pure eco-friendly fragrance & mosquito solutions to get started.
                </p>
                <Button
                  onClick={() => setIsCartOpen(false)}
                  variant="primary"
                  size="sm"
                >
                  Browse Store Catalog
                </Button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-bold text-slate-800 hover:text-brand-dark line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-brand-dark mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-brand-cream"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-brand-cream"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-brand-cream/30 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900 text-base">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Taxes and shipping calculated at checkout
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-brand-dark text-brand-dark font-bold text-xs hover:bg-brand-dark hover:text-white transition-all text-center"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-brand-hover shadow-soft transition-all text-center gap-1"
                >
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
