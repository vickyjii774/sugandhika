"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { wishlistApi, authApi } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Leaf,
  ExternalLink,
} from "lucide-react";

export default function WishlistPageClient() {
  const { addToCart, toggleWishlist: cartToggleWishlist } = useCart();
  const wishlistCtx = useWishlist ? useWishlist() : null;

  // Resolved toggleWishlist from either CartProvider or WishlistProvider
  const toggleWishlist = cartToggleWishlist || wishlistCtx?.toggleWishlist;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync wishlist on mount: load from Django API if authenticated, else from local context
  useEffect(() => {
    let isMounted = true;

    async function loadWishlist() {
      if (authApi.isAuthenticated()) {
        try {
          const apiItems = await wishlistApi.getWishlist();
          if (isMounted && Array.isArray(apiItems) && apiItems.length > 0) {
            const formatted = apiItems.map((item) => ({
              productId: String(item.product_id || item.productId || item.id),
              name: item.product_name || item.name,
              price: parseFloat(item.product_price || item.price) || 0,
              image:
                item.product_image ||
                item.image ||
                "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
              slug: item.product_slug || item.slug || "",
              stock: item.product_stock || 50,
            }));
            setItems(formatted);
            setLoading(false);
            return;
          }
        } catch (err) {
          // If server call fails, fallback to local context
        }
      }

      // Fallback to local context / localStorage
      if (isMounted) {
        if (wishlistCtx?.wishlist && wishlistCtx.wishlist.length > 0) {
          setItems(wishlistCtx.wishlist);
        } else {
          setItems([]);
        }
        setLoading(false);
      }
    }

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [wishlistCtx?.wishlist]);

  // Handle Remove from Wishlist
  const handleRemove = async (item) => {
    // 1. Update UI state immediately
    setItems((prev) => prev.filter((i) => i.productId !== item.productId));

    // 2. Call Django wishlistApi if authenticated
    if (authApi.isAuthenticated()) {
      const pid = parseInt(item.productId, 10);
      if (!isNaN(pid)) {
        try {
          await wishlistApi.remove(pid);
        } catch {
          // Silent fallback
        }
      }
    }

    // 3. Update local context if present
    if (toggleWishlist) {
      try {
        toggleWishlist(item);
      } catch {}
    }

    toast.info(`Removed "${item.name}" from wishlist.`);
  };

  // Handle Add to Cart
  const handleAddToCart = (item) => {
    addToCart(
      {
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        slug: item.slug,
        stock: item.stock || 50,
      },
      1
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-cream text-brand-dark flex items-center justify-center mx-auto shadow-soft animate-spin">
          <Heart className="w-6 h-6 text-brand-dark" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading your saved items...</p>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 animate-fadeIn">
        <div className="w-24 h-24 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-soft border border-red-100">
          <Heart className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Your Wishlist is Empty</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Save your favorite organic mosquito repellent sticks and aromatic room wellness mists here to review or order later.
          </p>
        </div>
        <div>
          <Link href="/shop" className="inline-block">
            <Button variant="primary" size="lg" className="rounded-2xl px-8 shadow-soft">
              <ArrowLeft className="w-4 h-4 mr-2" /> Explore Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-1 block">
            Saved Favorites
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">My Saved Wishlist</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {items.length} {items.length === 1 ? "eco-friendly item" : "eco-friendly items"} saved for later
          </p>
        </div>
        <Link href="/shop" className="self-start sm:self-auto">
          <Button variant="outline" size="sm" className="rounded-xl">
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Image & Remove Action */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item.name} from wishlist`}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-red-500 shadow-soft backdrop-blur-sm transition-all"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-lg bg-brand-light/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm">
                  <Leaf className="w-3 h-3" /> 100% Eco
                </span>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <Link
                  href={`/shop/${item.slug}`}
                  className="text-sm font-bold text-slate-800 hover:text-brand-dark line-clamp-2 transition-colors"
                >
                  {item.name}
                </Link>
                <p className="text-base font-extrabold text-brand-dark mt-1.5 font-mono">
                  {formatCurrency(item.price)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Button
                  onClick={() => handleAddToCart(item)}
                  variant="primary"
                  size="sm"
                  className="w-full rounded-xl"
                  aria-label={`Add ${item.name} to cart`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Move To Cart
                </Button>
                <Link href={`/shop/${item.slug}`} className="block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-xl text-slate-500 hover:text-slate-900 text-xs"
                  >
                    View Details <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
