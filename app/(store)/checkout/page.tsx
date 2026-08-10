"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateCoupon, createOrder } from "@/lib/actions/order.actions";
import { getWebsiteSettings } from "@/lib/actions/store.actions";
import { toast } from "sonner";
import {
  ShieldCheck,
  QrCode,
  Truck,
  Tag,
  CheckCircle,
  Upload,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cart, cartSubtotal, clearCart } = useCart();
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [street, setStreet] = useState("Lazimpat Road, Ward #3");
  const [city, setCity] = useState("Kathmandu");
  const [state, setState] = useState("Bagmati");
  const [postalCode, setPostalCode] = useState("44600");
  const [notes, setNotes] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "FONEPAY_QR">("COD");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [fonepayQrUrl, setFonepayQrUrl] = useState("https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getWebsiteSettings().then((settings) => {
      if (settings?.fonepayQrUrl) {
        setFonepayQrUrl(settings.fonepayQrUrl);
      }
    });
  }, []);

  const shippingFee = cartSubtotal >= 1500 ? 0 : 100;
  const finalAmount = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    const res = await validateCoupon(couponCode, cartSubtotal);
    setValidatingCoupon(false);

    if (res.success) {
      setAppliedCoupon(res.code || couponCode.toUpperCase());
      setDiscountAmount(res.discountAmount || 0);
      toast.success(res.message);
    } else {
      toast.error(res.error || "Failed to apply coupon");
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
        toast.success("Payment screenshot uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (paymentMethod === "FONEPAY_QR" && !transactionId.trim()) {
      toast.error("Please enter your Fonepay Transaction ID.");
      return;
    }

    setIsSubmitting(true);
    const userId = (session?.user as any)?.id || "guest-user";

    const res = await createOrder({
      userId,
      items: cart.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        title: i.name,
        image: i.image,
      })),
      checkoutData: {
        fullName,
        phone,
        email,
        street,
        city,
        state,
        postalCode,
        paymentMethod,
        transactionId: transactionId || undefined,
        paymentScreenshot: paymentScreenshot || undefined,
        couponCode: appliedCoupon || undefined,
        notes: notes || undefined,
      },
    });

    setIsSubmitting(false);

    if (res.success) {
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-success/${res.orderId}`);
    } else {
      toast.error(res.error || "Failed to place order.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Checkout Order</h1>
        <p className="text-xs text-slate-500 mt-1">Complete your delivery & payment details</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address Section */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-brand-dark" /> Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
              />
              <Input
                label="Phone Number *"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 9841234567"
              />
            </div>

            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@example.com"
            />

            <Input
              label="Street Address *"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="House #, Street name, Area"
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City *"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State / Province *"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <Input
                label="Postal Code *"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-brand-dark" /> Select Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: COD */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-brand-dark bg-brand-cream/40 shadow-soft"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "COD" ? "border-brand-dark bg-brand-dark text-white" : "border-slate-300"
                  }`}>
                    {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Cash On Delivery (COD)</h4>
                    <p className="text-[11px] text-slate-500">Pay cash upon package arrival</p>
                  </div>
                </div>
              </div>

              {/* Option 2: Fonepay QR */}
              <div
                onClick={() => setPaymentMethod("FONEPAY_QR")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "FONEPAY_QR"
                    ? "border-brand-dark bg-brand-cream/40 shadow-soft"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "FONEPAY_QR" ? "border-brand-dark bg-brand-dark text-white" : "border-slate-300"
                  }`}>
                    {paymentMethod === "FONEPAY_QR" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      Fonepay QR Code <QrCode className="w-4 h-4 text-brand-dark" />
                    </h4>
                    <p className="text-[11px] text-slate-500">Scan QR & upload transaction ref</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fonepay QR Instruction Panel */}
            {paymentMethod === "FONEPAY_QR" && (
              <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white rounded-2xl shrink-0 shadow-lg">
                    <img
                      src={fonepayQrUrl}
                      alt="Fonepay QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="px-2.5 py-1 rounded-full bg-brand-light/30 text-brand-light text-[10px] font-bold uppercase tracking-wider">
                      Fonepay Merchant QR
                    </span>
                    <h4 className="text-base font-bold">Scan with any mobile banking app</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. Open eSewa, Khalti, or Mobile Banking app.<br />
                      2. Scan the QR code to pay exact total: <strong className="text-brand-light">{formatCurrency(finalAmount)}</strong><br />
                      3. Enter your Transaction ID and attach screenshot below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <Input
                    label="Fonepay Transaction / Reference ID *"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. FONE-89210921"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Payment Screenshot (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-brand-light" />
                        {paymentScreenshot ? "Screenshot Attached ✔" : "Upload Receipt Screenshot"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-brand-dark" /> Apply Coupon Code
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold focus:outline-none focus:border-brand-dark"
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                variant="secondary"
                size="sm"
                isLoading={validatingCoupon}
              >
                Apply
              </Button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Applied: {appliedCoupon} (-{formatCurrency(discountAmount)})
              </p>
            )}
          </div>

          {/* Checkout Order Summary Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Order Summary ({cart.length} items)
            </h3>

            {/* Cart item quick list */}
            <div className="max-h-48 overflow-y-auto space-y-3 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.productId} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{item.name} x {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? <span className="text-brand-dark font-bold">FREE</span> : formatCurrency(shippingFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-extrabold text-slate-900">
                <span>Total Payable</span>
                <span className="text-brand-dark">{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              <Lock className="w-4 h-4 mr-2" /> Place Order Now
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
