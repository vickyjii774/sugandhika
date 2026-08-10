"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addCustomerAddress } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

export function AddressForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Kathmandu");
  const [state, setState] = useState("Bagmati");
  const [postalCode, setPostalCode] = useState("44600");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await addCustomerAddress(userId, {
      title,
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country: "Nepal",
      isDefault: true,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Address added successfully!");
      setFullName("");
      setPhone("");
      setStreet("");
    } else {
      toast.error(res.error || "Failed to add address.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Add New Address</h3>

      <Input label="Address Label" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Home / Work" />
      <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Aarav Sharma" />
      <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+977 9841234567" />
      <Input label="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} required placeholder="Lazimpat Road #42" />

      <div className="grid grid-cols-2 gap-2">
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
      </div>

      <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="w-full">
        Save Address
      </Button>
    </form>
  );
}
