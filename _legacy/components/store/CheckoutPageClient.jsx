"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  orderApi,
  storeApi,
  authApi,
  addressApi,
} from "@/lib/api/client";
import { toast } from "sonner";
import {
  ShieldCheck,
  QrCode,
  Truck,
  Tag,
  CheckCircle,
  Upload,
  Lock,
  ArrowRight,
  ArrowLeft,
  LogIn,
  UserPlus,
  ShoppingBag,
  Sparkles,
  Info,
  X,
  CreditCard,
  MapPin,
  FileText,
} from "lucide-react";

export default function CheckoutPageClient() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();

  // Authentication State
  const [isAuth, setIsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Quick inline login state if unauthenticated
  const [inlineEmail, setInlineEmail] = useState("");
  const [inlinePassword, setInlinePassword] = useState("");
  const [inlineLoading, setInlineLoading] = useState(false);

  // Store Settings (shipping fees, fonepay qr url)
  const [shippingFeeRate, setShippingFeeRate] = useState(100);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);
  const [fonepayQrUrl, setFonepayQrUrl] = useState(
    "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80"
  );

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Form Management with react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      street: "",
      city: "Kathmandu",
      state: "Bagmati",
      postalCode: "44600",
      country: "Nepal",
      saveAddress: false,
      paymentMethod: "COD",
      transactionId: "",
      paymentScreenshotUrl: "",
      customerNote: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  // Load auth state, profile, and settings on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeCheckout() {
      const authenticated = authApi.isAuthenticated();
      if (isMounted) setIsAuth(authenticated);

      // Load store settings
      try {
        const settings = await storeApi.getStoreSettings();
        if (isMounted && settings) {
          if (settings.shipping_fee !== undefined) {
            setShippingFeeRate(parseFloat(settings.shipping_fee) || 100);
          }
          if (settings.free_shipping_threshold !== undefined) {
            setFreeShippingThreshold(parseFloat(settings.free_shipping_threshold) || 1500);
          }
          if (settings.fonepay_qr_url) {
            setFonepayQrUrl(settings.fonepay_qr_url);
          }
        }
      } catch {
        // Fallback to defaults
      }

      // If logged in, fetch user profile & saved addresses
      if (authenticated) {
        try {
          const profile = await authApi.getProfile();
          if (isMounted && profile) {
            const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || "";
            if (name) setValue("fullName", name);
            if (profile.email) setValue("email", profile.email);
            if (profile.phone) setValue("phone", profile.phone);
          }
        } catch {
          // Best-effort profile fetch
        }

        try {
          const addresses = await addressApi.getAddresses();
          if (isMounted && Array.isArray(addresses) && addresses.length > 0) {
            setSavedAddresses(addresses);
            const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
            if (defaultAddr) {
              if (defaultAddr.full_name) setValue("fullName", defaultAddr.full_name);
              if (defaultAddr.phone) setValue("phone", defaultAddr.phone);
              setValue("street", defaultAddr.street || "");
              setValue("city", defaultAddr.city || "Kathmandu");
              setValue("state", defaultAddr.state || "Bagmati");
              setValue("postalCode", defaultAddr.postal_code || "44600");
              setValue("country", defaultAddr.country || "Nepal");
            }
          }
        } catch {
          // Best-effort address fetch
        }
      }

      // Check for previously applied coupon from cart page
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
      } catch {}

      if (isMounted) setCheckingAuth(false);
    }

    initializeCheckout();

    return () => {
      isMounted = false;
    };
  }, [setValue]);

  // Shipping & Total calculations
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : shippingFeeRate;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Inline sign-in handler for unauthenticated users
  const handleInlineLogin = async (e) => {
    e.preventDefault();
    if (!inlineEmail || !inlinePassword) {
      toast.error("Please enter email and password.");
      return;
    }

    setInlineLoading(true);
    try {
      await authApi.login(inlineEmail, inlinePassword);
      setIsAuth(true);
      toast.success("Signed in successfully! You may now complete your order.");

      // Fetch profile data to populate fields
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || "";
          if (name) setValue("fullName", name);
          if (profile.email) setValue("email", profile.email);
          if (profile.phone) setValue("phone", profile.phone);
        }
        const addresses = await addressApi.getAddresses();
        if (Array.isArray(addresses) && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
          if (defaultAddr) {
            setValue("street", defaultAddr.street || "");
            setValue("city", defaultAddr.city || "Kathmandu");
            setValue("state", defaultAddr.state || "Bagmati");
            setValue("postalCode", defaultAddr.postal_code || "44600");
          }
        }
      } catch {}
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || "Invalid email or password.");
    } finally {
      setInlineLoading(false);
    }
  };

  // Coupon validation
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code.");
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await orderApi.validateCoupon(code, cartSubtotal);
      if (res && res.valid) {
        const discount = parseFloat(res.discount_amount) || 0;
        setAppliedCoupon(res.code || code);
        setDiscountAmount(discount);
        try {
          sessionStorage.setItem(
            "sugandhika_coupon",
            JSON.stringify({ code: res.code || code, discountAmount: discount })
          );
        } catch {}
        toast.success(`Coupon "${res.code || code}" applied! Saved ${formatCurrency(discount)}`);
      } else {
        toast.error(res?.detail || "Invalid or expired coupon.");
      }
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || "Failed to apply coupon.");
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
    toast.info("Coupon removed.");
  };

  // Order submission
  const onSubmit = async (data) => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!isAuth) {
      toast.error("Please sign in or create an account to place an order.");
      return;
    }

    if (data.paymentMethod === "FONEPAY_QR" && !data.transactionId?.trim()) {
      toast.error("Please enter your Fonepay Transaction Reference ID.");
      return;
    }

    // Prepare items payload with integer product_id and integer quantity
    const formattedItems = cart.map((item) => {
      const parsedId = parseInt(item.productId, 10);
      return {
        product_id: isNaN(parsedId) ? 1 : parsedId,
        quantity: parseInt(item.quantity, 10) || 1,
      };
    });

    const payload = {
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || "",
      street: data.street.trim(),
      city: data.city.trim(),
      state: data.state?.trim() || "",
      postal_code: data.postalCode?.trim() || "",
      country: data.country?.trim() || "Nepal",
      save_address: Boolean(data.saveAddress),
      items: formattedItems,
      payment_method: data.paymentMethod,
      coupon_code: appliedCoupon || "",
      customer_note: data.customerNote?.trim() || "",
      fonepay_transaction_id:
        data.paymentMethod === "FONEPAY_QR" ? data.transactionId?.trim() || "" : "",
      payment_screenshot_url:
        data.paymentMethod === "FONEPAY_QR" ? data.paymentScreenshotUrl?.trim() || "" : "",
    };

    try {
      const orderRes = await orderApi.checkout(payload);

      if (orderRes && orderRes.order_number) {
        clearCart();
        try {
          sessionStorage.removeItem("sugandhika_coupon");
        } catch {}
        toast.success(`Order placed successfully! Reference #${orderRes.order_number}`);
        router.push(`/order-success/${orderRes.order_number}`);
      } else {
        toast.error("Order placed, but did not receive a confirmation number.");
      }
    } catch (err) {
      const errMsg =
        err?.data?.detail ||
        (typeof err?.data === "object" ? Object.values(err.data).flat().join(" ") : null) ||
        err?.message ||
        "Failed to place order. Please try again.";
      toast.error(errMsg);
    }
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-cream text-brand-dark flex items-center justify-center mx-auto shadow-soft animate-spin">
          <Sparkles className="w-6 h-6 text-brand-dark" />
        </div>
        <p className="text-sm font-medium text-slate-600">Preparing your checkout experience...</p>
      </div>
    );
  }

  // Unauthenticated: Show Login Prompt Banner
  if (!isAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
        {/* Breadcrumb / Back link */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/cart" className="hover:text-brand-dark font-medium flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Checkout</span>
        </div>

        {/* Login Prompt Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-3 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-cream text-brand-dark flex items-center justify-center mx-auto shadow-soft border border-brand-light/30">
              <Lock className="w-8 h-8 text-brand-dark" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Sign In to Complete Your Order
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Please sign in to your Sugandhika account to securely complete checkout, earn loyalty points, and track your package in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4 border-t border-slate-100">
            {/* Option A: Quick Inline Sign In */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-brand-dark" />
                <h2 className="text-sm font-bold text-slate-900">Existing Customer Sign In</h2>
              </div>
              <form onSubmit={handleInlineLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inlineEmail}
                    onChange={(e) => setInlineEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-brand-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={inlinePassword}
                    onChange={(e) => setInlinePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-brand-dark"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full rounded-xl"
                  isLoading={inlineLoading}
                >
                  Sign In & Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </div>

            {/* Option B: Account Actions & Order Overview */}
            <div className="space-y-4">
              <div className="p-5 bg-brand-cream rounded-2xl border border-brand-light/30 space-y-3">
                <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> New to Sugandhika?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Creating an account takes less than 30 seconds and gives you access to special offers, seasonal herbal harvest discounts, and quick re-ordering.
                </p>
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <Link href="/register?redirect=/checkout" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-xl">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/login?redirect=/checkout" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full rounded-xl border border-slate-200">
                      Standard Login
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Order Cart preview */}
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-soft space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-brand-dark" /> Cart ({cart.length} items)
                  </span>
                  <span className="font-mono text-brand-dark">{formatCurrency(grandTotal)}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Your cart items are securely saved and will be ready right after you sign in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart fallback
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-brand-cream text-brand-dark flex items-center justify-center mx-auto shadow-soft">
          <ShoppingBag className="w-10 h-10 text-brand-light" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Please add items to your cart before proceeding to the checkout page.
        </p>
        <Link href="/shop" className="inline-block">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // Full Checkout Form for Logged-In User
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/cart" className="hover:text-brand-dark font-medium flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Cart
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">Checkout Order</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete your delivery & payment details below
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-dark font-semibold bg-brand-cream px-3 py-1.5 rounded-xl border border-brand-light/30">
          <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted Checkout
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Shipping & Payment (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Shipping Address */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-dark" /> Delivery Information
              </h2>
              {savedAddresses.length > 0 && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-dark" /> Prefilled from default address
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                {...register("fullName", { required: "Full name is required" })}
                error={errors.fullName?.message}
                placeholder="Aarav Sharma"
              />
              <Input
                label="Phone Number *"
                {...register("phone", { required: "Phone number is required" })}
                error={errors.phone?.message}
                placeholder="+977 9841234567"
              />
            </div>

            <Input
              label="Email Address (for order receipts)"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="aarav@example.com"
            />

            <Input
              label="Street Address *"
              {...register("street", { required: "Street address is required" })}
              error={errors.street?.message}
              placeholder="House #, Street name, Tole / Neighborhood"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City *"
                {...register("city", { required: "City is required" })}
                error={errors.city?.message}
                placeholder="Kathmandu"
              />
              <Input
                label="State / Province *"
                {...register("state", { required: "State is required" })}
                error={errors.state?.message}
                placeholder="Bagmati"
              />
              <Input
                label="Postal Code *"
                {...register("postalCode", { required: "Postal code is required" })}
                error={errors.postalCode?.message}
                placeholder="44600"
              />
            </div>

            <Input
              label="Country *"
              {...register("country", { required: "Country is required" })}
              error={errors.country?.message}
              placeholder="Nepal"
            />

            {/* Save Address Checkbox */}
            <div className="pt-2 flex items-center gap-2.5">
              <input
                id="saveAddress"
                type="checkbox"
                {...register("saveAddress")}
                className="w-4 h-4 rounded text-brand-dark focus:ring-brand-dark border-slate-300"
              />
              <label htmlFor="saveAddress" className="text-xs text-slate-700 font-medium cursor-pointer">
                Save this shipping address to my account for faster checkout next time
              </label>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-4">
              <ShieldCheck className="w-5 h-5 text-brand-dark" /> Select Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: COD */}
              <div
                onClick={() => setValue("paymentMethod", "COD")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-brand-dark bg-brand-cream/60 shadow-soft"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentMethod === "COD"
                        ? "border-brand-dark bg-brand-dark text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Cash On Delivery (COD)</h3>
                    <p className="text-[11px] text-slate-500">Pay cash upon delivery at your doorstep</p>
                  </div>
                </div>
              </div>

              {/* Option 2: Fonepay QR */}
              <div
                onClick={() => setValue("paymentMethod", "FONEPAY_QR")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "FONEPAY_QR"
                    ? "border-brand-dark bg-brand-cream/60 shadow-soft"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentMethod === "FONEPAY_QR"
                        ? "border-brand-dark bg-brand-dark text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {paymentMethod === "FONEPAY_QR" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      Fonepay QR Code <QrCode className="w-4 h-4 text-brand-dark" />
                    </h3>
                    <p className="text-[11px] text-slate-500">Scan QR via any bank or mobile wallet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fonepay QR Instruction Panel */}
            {paymentMethod === "FONEPAY_QR" && (
              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white rounded-2xl shrink-0 shadow-lg">
                    <img
                      src={fonepayQrUrl}
                      alt="Fonepay Merchant QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="px-2.5 py-1 rounded-full bg-brand-light/30 text-brand-light text-[10px] font-bold uppercase tracking-wider inline-block">
                      Instant Merchant QR
                    </span>
                    <h4 className="text-base font-bold">Scan & Pay Exact Amount</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. Open eSewa, Khalti, IME Pay, or your Mobile Banking app.<br />
                      2. Scan the QR code and transfer the exact total:{" "}
                      <strong className="text-brand-light font-mono">{formatCurrency(grandTotal)}</strong><br />
                      3. Paste the transaction reference ID below to verify your payment.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Fonepay Transaction / Reference ID *
                    </label>
                    <input
                      type="text"
                      {...register("transactionId", {
                        required: paymentMethod === "FONEPAY_QR" ? "Transaction ID is required" : false,
                      })}
                      placeholder="e.g. FONE-9281829"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-light"
                    />
                    {errors.transactionId && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.transactionId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Payment Screenshot URL (Optional)
                    </label>
                    <input
                      type="url"
                      {...register("paymentScreenshotUrl")}
                      placeholder="https://... receipt image link"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-light"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Direct image link or receipt confirmation URL
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Note */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label htmlFor="customerNote" className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-dark" /> Order Notes or Delivery Instructions (Optional)
              </label>
              <textarea
                id="customerNote"
                rows={3}
                {...register("customerNote")}
                placeholder="e.g. Please leave the package with the guard or call before delivery."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon (1 col) */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-brand-dark" /> Apply Promo Code
            </h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 font-mono tracking-wider">
                    {appliedCoupon} (-{formatCurrency(discountAmount)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  aria-label="Remove applied coupon"
                  className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold focus:outline-none focus:border-brand-dark"
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  variant="secondary"
                  size="sm"
                  className="shrink-0 px-4 rounded-xl"
                  disabled={validatingCoupon || !couponCode.trim()}
                  isLoading={validatingCoupon}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Checkout Order Summary Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Order Summary ({cart.length} {cart.length === 1 ? "item" : "items"})
            </h2>

            {/* Quick Item List */}
            <div className="max-h-56 overflow-y-auto space-y-3 divide-y divide-slate-100 pr-1">
              {cart.map((item) => (
                <div key={item.productId} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                      alt=""
                      className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-50 border border-slate-100"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0 font-mono">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Details */}
            <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 font-mono">{formatCurrency(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-xl">
                  <span>Discount</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-brand-dark font-extrabold uppercase">FREE</span>
                  ) : (
                    <span className="font-mono">{formatCurrency(shippingFee)}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-base font-extrabold text-slate-900">
                <span>Total Payable</span>
                <span className="text-xl text-brand-dark font-serif font-black font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-2xl shadow-soft"
              isLoading={isSubmitting}
            >
              <Lock className="w-4 h-4 mr-2" /> Place Order Now
            </Button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400">
                By placing your order, you agree to Sugandhika's Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
