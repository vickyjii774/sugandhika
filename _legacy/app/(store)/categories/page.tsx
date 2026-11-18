import React from "react";
import Link from "next/link";
import { getCategories } from "@/lib/actions/store.actions";
import { ArrowRight, Leaf } from "lucide-react";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
          Product Lineup
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
          Browse All Product Categories
        </h1>
        <p className="text-xs text-slate-500">
          Discover our complete eco-friendly range from mosquito sticks to botanical mists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="group bg-white rounded-3xl border border-slate-100 shadow-soft hover:shadow-hover overflow-hidden transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src={cat.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-brand-dark shadow-sm">
                {cat._count.products} Products
              </div>
            </div>

            <div className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-dark transition-colors font-serif">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                {cat.description}
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-brand-dark group-hover:translate-x-1 transition-transform">
                Explore Category Products <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
