"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success("Password reset instructions have been sent to your email!");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-light flex items-center justify-center text-white mx-auto shadow-soft">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Reset Password</h1>
          <p className="text-xs text-slate-500">Enter your email to receive password recovery instructions</p>
        </div>

        {submitted ? (
          <div className="p-6 bg-brand-cream rounded-2xl border border-brand-light/30 text-center space-y-4">
            <MailCheck className="w-10 h-10 text-brand-dark mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Check Your Inbox</h3>
            <p className="text-xs text-slate-600">
              We have sent password reset instructions to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="inline-block">
              <Button variant="primary" size="sm">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@sugandhika.com"
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-brand-dark flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
