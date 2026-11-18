"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Leaf,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-green-900 text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Trust Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-b border-white/10">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Leaf className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                100% Herbal & Organic
              </h4>
              <p className="mt-1 text-xs text-white">
                Plant-based ingredients and natural protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                Safe & Trusted
              </h4>
              <p className="mt-1 text-xs text-white">
                Carefully crafted for everyday use
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                Himalayan Crafted
              </h4>
              <p className="mt-1 text-xs text-white">
                Inspired by Nepal's natural heritage
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 py-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>

              <span className="text-2xl font-bold tracking-tight text-white font-serif">
                Sugandhika
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-white">
              Sugandhika brings together Nepal's natural heritage and modern
              living through thoughtfully crafted herbal fragrances,
              botanical products, and traditional Himalayan-inspired
              wellness essentials.
            </p>

            {/* Contact Information */}
            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-3 text-sm text-white">
                <MapPin className="w-4 h-4 text-white shrink-0" />
                <span>Lazimpat, Kathmandu, Nepal</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-white">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <a
                  href="tel:+9779801234567"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  +977 9801234567
                </a>
              </div>

              <div className="flex items-center gap-3 text-sm text-white">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a
                  href="mailto:support@sugandhika.com"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  support@sugandhika.com
                </a>
              </div>

            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-5">
              Shop
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/shop?category=mosquito-killer-stick"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Mosquito Killer Sticks
                </Link>
              </li>

              <li>
                <Link
                  href="/shop?category=mosquito-powder"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Mosquito Powder
                </Link>
              </li>

              <li>
                <Link
                  href="/shop?category=mosquito-liquid"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Mosquito Liquid
                </Link>
              </li>

              <li>
                <Link
                  href="/shop?category=natural-air-freshener"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Natural Air Fresheners
                </Link>
              </li>

              <li>
                <Link
                  href="/shop?category=herbal-incense"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Herbal Incense
                </Link>
              </li>

              <li>
                <Link
                  href="/shop?category=combo-packs"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Combo & Gift Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-5">
              Customer Care
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/customer"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  My Account
                </Link>
              </li>

              <li>
                <Link
                  href="/customer/orders"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Track My Order
                </Link>
              </li>

              <li>
                <Link
                  href="/wishlist"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  My Wishlist
                </Link>
              </li>

              <li>
                <Link
                  href="/faq"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  FAQs & Help
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Contact Support
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-center py-6 border-t border-white/10 text-xs text-white">
          <p className="text-white">
            © {new Date().getFullYear()} Sugandhika. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}