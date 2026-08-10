"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-soft">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Your Wishlist is Empty</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Save your favorite organic mosquito repellents and aromatic room mists to review later.
        </p>
        <Link href="/shop" className="inline-block">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">My Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">
          {wishlist.length} saved eco-friendly items
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.productId} className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-square bg-slate-50">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <button
                onClick={() => toggleWishlist(item)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-red-500 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <Link href={`/shop/${item.slug}`} className="text-sm font-bold text-slate-800 hover:text-brand-dark line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-sm font-extrabold text-brand-dark mt-1">
                  {formatCurrency(item.price)}
                </p>
              </div>

              <Button
                onClick={() =>
                  addToCart({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    slug: item.slug,
                    stock: 50,
                  })
                }
                variant="primary"
                size="sm"
                className="w-full"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Move To Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
