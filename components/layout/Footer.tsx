"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Leaf,
  Mail,
  Phone,
  MapPin,
  Send,
  ShieldCheck,
  Award,
  Heart,
} from "lucide-react";
import { subscribeNewsletter } from "@/lib/actions/store.actions";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const res = await subscribeNewsletter(email);
    setSubmitting(false);
    if (res.success) {
      toast.success(res.message);
      setEmail("");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eco Trust Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark/20 border border-brand-light/30 flex items-center justify-center text-brand-light shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Herbal & Organic</h4>
              <p className="text-xs text-slate-400">Zero toxic fumes or synthetic DEET</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark/20 border border-brand-light/30 flex items-center justify-center text-brand-light shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Kid & Pet Safe Protection</h4>
              <p className="text-xs text-slate-400">Pure plant-extracted repellents</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark/20 border border-brand-light/30 flex items-center justify-center text-brand-light shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Himalayan Crafted Luxury</h4>
              <p className="text-xs text-slate-400">Authentic scents & therapeutic oils</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-brand-light flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white font-serif">
                Sugandhika
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Sugandhika is Nepal's premier eco-friendly luxury brand specializing in organic mosquito killer sticks, botanical air fresheners, and traditional Himalayan herbal incense.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-brand-light shrink-0" />
                <span>Lazimpat, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-brand-light shrink-0" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-brand-light shrink-0" />
                <span>support@sugandhika.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-brand-dark/40 pb-2">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/shop?category=mosquito-killer-stick" className="hover:text-brand-light transition-colors">
                  Mosquito Killer Stick
                </Link>
              </li>
              <li>
                <Link href="/shop?category=mosquito-powder" className="hover:text-brand-light transition-colors">
                  Mosquito Powder
                </Link>
              </li>
              <li>
                <Link href="/shop?category=mosquito-liquid" className="hover:text-brand-light transition-colors">
                  Mosquito Liquid
                </Link>
              </li>
              <li>
                <Link href="/shop?category=natural-air-freshener" className="hover:text-brand-light transition-colors">
                  Natural Air Freshener
                </Link>
              </li>
              <li>
                <Link href="/shop?category=herbal-incense" className="hover:text-brand-light transition-colors">
                  Herbal Incense
                </Link>
              </li>
              <li>
                <Link href="/shop?category=combo-packs" className="hover:text-brand-light transition-colors">
                  Combo & Gift Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-brand-dark/40 pb-2">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/customer" className="hover:text-brand-light transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/customer/orders" className="hover:text-brand-light transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-brand-light transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-light transition-colors">
                  FAQs & Help
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-light transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-brand-dark/40 pb-2">
              Eco Newsletter
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Subscribe to get exclusive discount codes and eco-living fragrance tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-light"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-brand-dark hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Sugandhika E-Commerce. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for a chemical-free home.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
