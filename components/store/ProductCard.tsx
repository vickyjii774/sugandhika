"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Leaf } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { RatingStars } from "@/components/ui/RatingStars";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    images?: Array<{ url: string }>;
    category?: { name: string };
    avgRating?: number;
    reviewCount?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const primaryImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80";

  const isSaved = mounted && isInWishlist(product.id);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discountPercent && (
          <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
            Save {discountPercent}%
          </span>
        )}
        <span className="px-2.5 py-1 rounded-lg bg-brand-light/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm">
          <Leaf className="w-3 h-3" /> 100% Eco
        </span>
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: primaryImage,
            slug: product.slug,
          });
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-red-500 shadow-soft backdrop-blur-sm transition-all"
        title="Save to Wishlist"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isSaved ? "fill-red-500 text-red-500" : ""
          }`}
        />
      </button>

      {/* Image Banner */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden aspect-square bg-slate-50">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {product.category && (
            <span className="text-[11px] font-semibold text-brand-dark tracking-wider uppercase block mb-1">
              {product.category.name}
            </span>
          )}

          <Link href={`/shop/${product.slug}`}>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-dark transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2">
            <RatingStars
              rating={product.avgRating || 5}
              size="sm"
              showText
              count={product.reviewCount}
            />
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: primaryImage,
                slug: product.slug,
                stock: product.stock,
              })
            }
            className="p-2.5 rounded-xl bg-brand-dark text-white hover:bg-brand-hover shadow-soft transition-all active:scale-95 flex items-center justify-center"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
