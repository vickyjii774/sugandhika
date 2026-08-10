"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateWebsiteSettingsAction } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { QrCode, Upload, Save } from "lucide-react";

export function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [siteName, setSiteName] = useState(initialSettings?.siteName || "Sugandhika");
  const [tagline, setTagline] = useState(initialSettings?.tagline || "");
  const [contactEmail, setContactEmail] = useState(initialSettings?.contactEmail || "support@sugandhika.com");
  const [contactPhone, setContactPhone] = useState(initialSettings?.contactPhone || "+977 9801234567");
  const [address, setAddress] = useState(initialSettings?.address || "Lazimpat, Kathmandu, Nepal");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialSettings?.freeShippingThreshold || 1500);
  const [shippingFee, setShippingFee] = useState(initialSettings?.shippingFee || 100);
  const [fonepayQrUrl, setFonepayQrUrl] = useState(initialSettings?.fonepayQrUrl || "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFonepayQrUrl(reader.result as string);
        toast.success("New Fonepay QR code uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateWebsiteSettingsAction({
      siteName,
      tagline,
      contactEmail,
      contactPhone,
      address,
      freeShippingThreshold: Number(freeShippingThreshold),
      shippingFee: Number(shippingFee),
      fonepayQrUrl,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Settings updated successfully!");
    } else {
      toast.error(res.error || "Failed to update settings.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Store Info Box */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Store Brand & Contact Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Store Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
          <Input label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Support Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
          <Input label="Support Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
        </div>

        <Input label="Store Physical Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>

      {/* Fonepay QR Code Manager */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-brand-dark" /> Fonepay Merchant QR Code Settings
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="p-4 bg-slate-900 rounded-2xl shrink-0 shadow-lg text-center">
            <img src={fonepayQrUrl} alt="Fonepay QR" className="w-44 h-44 object-contain rounded-xl bg-white" />
            <span className="text-[10px] text-brand-light font-bold uppercase tracking-wider block mt-2">Active QR Code</span>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Upload New Fonepay QR Image</h4>
              <p className="text-xs text-slate-500">
                Upload your official Fonepay Merchant QR code. This will immediately display at checkout for customer scans.
              </p>
            </div>

            <div className="relative inline-block">
              <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" id="admin-qr-upload" />
              <label
                htmlFor="admin-qr-upload"
                className="px-4 py-2.5 bg-brand-cream border border-brand-light/30 rounded-xl text-xs font-bold text-brand-dark hover:bg-brand-dark hover:text-white cursor-pointer flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" /> Select QR Image File
              </label>
            </div>

            <Input
              label="Or Direct Image URL"
              value={fonepayQrUrl}
              onChange={(e) => setFonepayQrUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Shipping & Thresholds */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Shipping Fees & Thresholds</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Free Shipping Minimum Order (Rs.)"
            type="number"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
            required
          />
          <Input
            label="Standard Shipping Fee (Rs.)"
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
          <Save className="w-4 h-4 mr-2" /> Save All Settings
        </Button>
      </div>
    </form>
  );
}
