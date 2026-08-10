"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfile } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setSubmitting(true);
    const userId = (session.user as any).id;
    const res = await updateProfile(userId, { name, phone });
    setSubmitting(false);

    if (res.success) {
      toast.success("Profile updated successfully!");
      update({ name });
    } else {
      toast.error(res.error || "Failed to update profile.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal contact details and password</p>
      </div>

      <form onSubmit={handleUpdate} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-brand-light/20 text-brand-dark font-extrabold text-xl flex items-center justify-center">
            {name[0] || "U"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name || "User Account"}</h3>
            <p className="text-xs text-slate-500">{session?.user?.email}</p>
          </div>
        </div>

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address"
          value={session?.user?.email || ""}
          disabled
          className="bg-slate-50 text-slate-500"
        />

        <Input
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+977 9800000000"
        />

        <Button type="submit" variant="primary" isLoading={submitting}>
          Save Profile Changes
        </Button>
      </form>
    </div>
  );
}
