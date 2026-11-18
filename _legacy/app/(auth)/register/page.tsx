"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await registerUser({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Account created successfully! Logging you in...");
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      router.push("/");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to register account.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-light flex items-center justify-center text-white mx-auto shadow-soft">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Create Account</h1>
          <p className="text-xs text-slate-500">Join Sugandhika for pure eco luxury fragrances</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav Sharma"
          />

          <Input
            label="Email Address *"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aarav@example.com"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+977 9841234567"
          />

          <Input
            label="Password *"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input
            label="Confirm Password *"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Create Account <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-brand-dark hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
