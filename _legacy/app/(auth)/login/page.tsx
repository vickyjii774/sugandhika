"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password.");
    } else {
      toast.success("Logged in successfully!");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-light flex items-center justify-center text-white mx-auto shadow-soft">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to your Sugandhika account</p>
        </div>

        {/* Quick Demo Login Credentials Hint */}
        <div className="p-3 bg-brand-cream rounded-xl border border-brand-light/30 text-[11px] text-slate-700 space-y-1">
          <p className="font-bold text-brand-dark">Demo Credentials:</p>
          <p>• Admin: <strong>admin@sugandhika.com</strong> / admin123</p>
          <p>• Customer: <strong>customer@sugandhika.com</strong> / user123</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@sugandhika.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-bold text-brand-dark hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Sign In <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-brand-dark hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
