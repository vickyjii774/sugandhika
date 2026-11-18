"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  HelpCircle,
  Image as ImageIcon,
  Settings,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Orders & Payments", href: "/admin/orders", icon: ShoppingBag },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Tag },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { name: "Testimonials", href: "/admin/testimonials", icon: Sparkles },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Store Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between p-4 border-r border-slate-800 shrink-0">
      <div className="space-y-6">
        {/* Admin Brand */}
        <div className="flex items-center gap-2 px-2 py-2 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-dark to-brand-light flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <h2 className="font-bold text-white text-sm font-serif">Sugandhika</h2>
            <span className="text-[10px] text-brand-light font-bold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-dark text-white shadow-soft"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to Store button */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Storefront
        </Link>
      </div>
    </aside>
  );
}
