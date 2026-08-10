import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/actions/store.actions";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductClientActions } from "./ProductClientActions";
import { ReviewForm } from "./ReviewForm";
import {
  Leaf,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  Star,
} from "lucide-react";

export const revalidate = 0; // Dynamic PDP page

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images[0]?.url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80";

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-brand-dark">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-dark">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-dark">
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 line-clamp-1">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-soft">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm">
                Save {discountPercent}%
              </span>
            )}
            <span className="absolute top-4 right-4 px-3 py-1 bg-brand-dark/90 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-brand-light" /> 100% Herbal
            </span>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl overflow-hidden border-2 border-brand-dark cursor-pointer bg-white"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Purchase Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
              {product.category.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <RatingStars rating={product.avgRating} size="md" showText count={product.reviewCount} />
              <span className="text-xs text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <PackageCheck className="w-3.5 h-3.5" />
                {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-light/20 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-l-2 border-brand-dark pl-3">
              {product.shortDescription}
            </p>
          )}

          {/* Client Interactive Actions Component */}
          <ProductClientActions product={product} primaryImage={primaryImage} />

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-dark" /> 100% Chemical-Free Guarantee
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-dark" /> Fast Delivery Across Nepal
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-dark" /> Cash on Delivery Available
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-dark" /> Fonepay QR Verified
            </div>
          </div>
        </div>
      </div>

      {/* Description & Review Tabs */}
      <div className="pt-8 border-t border-slate-200 space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-serif">Product Description</h3>
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-6 rounded-2xl border border-slate-100">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">Customer Reviews</h3>
              <p className="text-xs text-slate-500">
                {product.reviewCount} verified ratings for this item
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {product.reviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-500 text-xs">
                  No reviews yet. Be the first customer to leave a review!
                </div>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-soft space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{rev.user.name}</h4>
                        <RatingStars rating={rev.rating} size="sm" />
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review Box */}
            <div>
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Carousel */}
      {product.relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 font-serif">Related Eco Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
