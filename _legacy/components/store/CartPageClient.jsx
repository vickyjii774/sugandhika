"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { orderApi, storeApi, authApi } from "@/lib/api/client";
import { toast } from "sonner";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Leaf,
  Tag,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

export default function CartPageClient() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartSubtotal } = useCart();

  // Settings & calculations
  const [shippingFeeRate, setShippingFeeRate] = useState(100);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Load store settings (shipping thresholds, etc.)
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const settings = await storeApi.getStoreSettings();
        if (isMounted && settings) {
          if (settings.shipping_fee !== undefined) {
            setShippingFeeRate(parseFloat(settings.shipping_fee) || 100);
          }
          if (settings.free_shipping_threshold !== undefined) {
            setFreeShippingThreshold(parseFloat(settings.free_shipping_threshold) || 1500);
          }
        }
      } catch (err) {
        // Fallback to defaults
      } finally {
        if (isMounted) setLoadingSettings(false);
      }
    }
    loadSettings();

    // Check if a coupon was previously saved in this browser session
    try {
      const savedCoupon = sessionStorage.getItem("sugandhika_coupon");
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        if (parsed?.code) {
          setAppliedCoupon(parsed.code);
          setDiscountAmount(parseFloat(parsed.discountAmount) || 0);
          setCouponCode(parsed.code);
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : shippingFeeRate;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Apply Coupon via Django API
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const trimmedCode = couponCode.trim().toUpperCase();
    if (!trimmedCode) {
      toast.error("Please enter a coupon code.");
      return;
    }

    if (cartSubtotal <= 0) {
      toast.error("Cannot apply coupon to an empty cart.");
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await orderApi.validateCoupon(trimmedCode, cartSubtotal);
      if (res && res.valid) {
        const discount = parseFloat(res.discount_amount) || 0;
        setAppliedCoupon(res.code || trimmedCode);
        setDiscountAmount(discount);
        try {
          sessionStorage.setItem(
            "sugandhika_coupon",
            JSON.stringify({ code: res.code || trimmedCode, discountAmount: discount })
          );
        } catch {}
        toast.success(`Coupon "${res.code || trimmedCode}" applied! Saved ${formatCurrency(discount)}`);
      } else {
        toast.error(res?.detail || "Invalid or expired coupon code.");
      }
    } catch (err) {
      const msg = err?.data?.detail || err?.message || "Failed to validate coupon.";
      if (err?.status === 401) {
        toast.error("Please sign in to apply coupon codes.");
      } else {
        toast.error(msg);
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    try {
      sessionStorage.removeItem("sugandhika_coupon");
    } catch {}
    toast.info("Coupon code removed.");
  };

  // Empty state
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 animate-fadeIn">
        <div className="w-24 h-24 rounded-3xl bg-brand-cream text-brand-dark flex items-center justify-center mx-auto shadow-soft border border-brand-light/20">
          <ShoppingBag className="w-12 h-12 text-brand-light" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Your Cart is Empty</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added any eco-friendly mosquito repellent sticks or aromatic wellness products to your cart yet.
          </p>
        </div>
        <div>
          <Link href="/shop" className="inline-block">
            <Button variant="primary" size="lg" className="rounded-2xl px-8 shadow-soft">
              <ArrowLeft className="w-4 h-4 mr-2" /> Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-1 block">
            Sugandhika Natural Wellness
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your eco-friendly items before proceeding to checkout ({cart.length} unique {cart.length === 1 ? "product" : "products"})
          </p>
        </div>
        <button
          onClick={clearCart}
          aria-label="Clear all items from shopping cart"
          className="self-start sm:self-auto text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Product Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                    />
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-brand-dark line-clamp-2 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs font-bold text-brand-dark">
                        {formatCurrency(item.price)} <span className="text-slate-400 font-normal">/ unit</span>
                      </p>
                      {item.stock !== undefined && item.stock <= 5 && item.stock > 0 && (
                        <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                          Only {item.stock} left in stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 min-w-[90px] text-right font-mono">
                      {formatCurrency(item.price * item.quantity)}
                    </span>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-2">
            <Link href="/shop" className="font-bold text-brand-dark hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
            <span>All herbal ingredients sourced ethically in Nepal</span>
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            {/* Price breakdown */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-slate-900 font-mono">{formatCurrency(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" /> Coupon ({appliedCoupon})
                  </span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-brand-dark font-extrabold uppercase tracking-wide">FREE</span>
                  ) : (
                    <span className="font-mono">{formatCurrency(shippingFee)}</span>
                  )}
                </span>
              </div>

              {/* Free Shipping Progress Hint */}
              {shippingFee > 0 && (
                <div className="text-[11px] text-brand-dark bg-brand-cream p-3 rounded-2xl border border-brand-light/30 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Free Shipping Available</span>
                    <span>Orders over {formatCurrency(freeShippingThreshold)}</span>
                  </div>
                  <p className="text-slate-600">
                    Add <strong className="text-brand-dark">{formatCurrency(freeShippingThreshold - cartSubtotal)}</strong> more for FREE shipping!
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-base font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span className="text-xl text-brand-dark font-serif font-black font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label htmlFor="coupon-input" className="block text-xs font-bold text-slate-800">
                Have a Promo or Coupon Code?
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800 tracking-wider font-mono">
                      {appliedCoupon}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    aria-label="Remove applied coupon"
                    className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="coupon-input"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. WELCOME10)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold focus:outline-none focus:border-brand-dark focus:bg-white transition-all placeholder:normal-case placeholder:font-normal"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 px-4 rounded-xl"
                    disabled={validatingCoupon || !couponCode.trim()}
                    isLoading={validatingCoupon}
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout CTA */}
            <Link href="/checkout" className="block w-full">
              <Button variant="primary" size="lg" className="w-full rounded-2xl shadow-soft">
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            {/* Trust and Guarantee badges */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-dark shrink-0" />
                <span>Cash on Delivery & Fonepay QR Supported</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-brand-dark shrink-0" />
                <span>100% Eco-Friendly & Chemical-Free Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
