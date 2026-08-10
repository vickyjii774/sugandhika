"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Truck,
  Leaf,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { SearchModal } from "./SearchModal";

export function Header() {
  const { data: session } = useSession();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = session?.user && (session.user as any).role === "ADMIN";

  return (
    <>
      {/* Top Banner Bar */}
      <div className="bg-brand-dark text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-medium">
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-brand-light" /> 100% Eco-Friendly & Organic
            </span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-light" /> Chemical-Free Protection
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-brand-light" />
            <span>Free Shipping on Orders Over Rs. 1,500</span>
          </div>
        </div>
      </div>

      {/* Main Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-brand-dark focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-brand-light flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl tracking-tight text-brand-dark font-serif">
                  Sugandhika
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-brand-light -mt-1">
                  Pure Eco Fragrance
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
              <Link href="/" className="hover:text-brand-dark transition-colors">
                Home
              </Link>
              <Link href="/shop" className="hover:text-brand-dark transition-colors">
                Shop Catalog
              </Link>
              <Link href="/categories" className="hover:text-brand-dark transition-colors">
                Categories
              </Link>
              <Link href="/contact" className="hover:text-brand-dark transition-colors">
                Contact Us
              </Link>
              <Link href="/faq" className="hover:text-brand-dark transition-colors">
                FAQs
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl text-slate-600 hover:text-brand-dark hover:bg-brand-cream transition-all"
                title="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-brand-dark hover:bg-brand-cream transition-all"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-light text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-brand-dark hover:bg-brand-cream transition-all"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-dark text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Session Menu */}
              {session ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl text-slate-700 hover:bg-brand-cream transition-all border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-brand-light/20 text-brand-dark flex items-center justify-center font-bold text-xs">
                      {session.user?.name?.[0] || "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {session.user?.name}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block animate-fadeIn z-50">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-dark hover:bg-brand-cream"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/customer"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-cream"
                    >
                      <UserIcon className="w-4 h-4" /> My Account
                    </Link>
                    <Link
                      href="/customer/orders"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-cream"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-dark rounded-xl hover:bg-brand-hover shadow-soft transition-all"
                >
                  <UserIcon className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-fadeIn">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-medium text-slate-800 hover:text-brand-dark py-1"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-medium text-slate-800 hover:text-brand-dark py-1"
            >
              Shop Catalog
            </Link>
            <Link
              href="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-medium text-slate-800 hover:text-brand-dark py-1"
            >
              Product Categories
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-medium text-slate-800 hover:text-brand-dark py-1"
            >
              Contact Us
            </Link>
            <Link
              href="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-medium text-slate-800 hover:text-brand-dark py-1"
            >
              FAQs
            </Link>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
