"use client";

import React, { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Heart, Minus, Plus } from "lucide-react";

interface ProductClientActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    slug: string;
  };
  primaryImage: string;
}

export function ProductClientActions({ product, primaryImage }: ProductClientActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isSaved = isInWishlist(product.id);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-4">
        {/* Quantity selector */}
        <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-white">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-bold text-sm text-slate-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={() =>
            addToCart(
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: primaryImage,
                slug: product.slug,
                stock: product.stock,
              },
              quantity
            )
          }
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={product.stock <= 0}
        >
          <ShoppingBag className="w-4 h-4 mr-2" /> Add {quantity} To Cart
        </Button>

        {/* Wishlist Button */}
        <button
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              name: product.name,
              price: product.price,
              image: primaryImage,
              slug: product.slug,
            })
          }
          className={`p-3.5 rounded-xl border transition-all ${
            isSaved
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="Save to wishlist"
        >
          <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>
    </div>
  );
}
