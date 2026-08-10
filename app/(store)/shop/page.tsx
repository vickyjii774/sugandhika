import React from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/actions/store.actions";
import { ProductCard } from "@/components/store/ProductCard";
import { SlidersHorizontal, Search, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SortDropdown } from "./SortDropdown";

export const revalidate = 0; // Dynamic catalog page

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const categorySlug = resolvedParams.category || "";
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const sortBy = (resolvedParams.sort as any) || "newest";
  const page = resolvedParams.page ? Number(resolvedParams.page) : 1;

  const [{ products, total, totalPages, currentPage }, categories] = await Promise.all([
    getProducts({
      query,
      categorySlug,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit: 12,
    }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/" className="hover:text-brand-dark">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-dark">Shop</span>
            {activeCategory && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-800">{activeCategory.name}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
            {activeCategory ? activeCategory.name : "Shop All Products"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} of {total} eco-friendly products
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Sort By:
          </label>
          <SortDropdown sortBy={sortBy} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-dark" /> Filters
              </h3>
              {(categorySlug || query || minPrice || maxPrice) && (
                <Link
                  href="/shop"
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear All
                </Link>
              )}
            </div>

            {/* Category Filter List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Categories
              </span>
              <div className="space-y-1">
                <Link
                  href={`/shop${query ? `?q=${query}` : ""}`}
                  className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    !categorySlug
                      ? "bg-brand-dark text-white font-bold"
                      : "text-slate-700 hover:bg-brand-cream"
                  }`}
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}${query ? `&q=${query}` : ""}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      categorySlug === cat.slug
                        ? "bg-brand-dark text-white font-bold"
                        : "text-slate-700 hover:bg-brand-cream"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({cat._count.products})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Price Ranges */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Price Filter
              </span>
              <div className="space-y-1 text-xs">
                {[
                  { label: "Under Rs. 400", min: 0, max: 400 },
                  { label: "Rs. 400 - Rs. 800", min: 400, max: 800 },
                  { label: "Rs. 800 - Rs. 1,500", min: 800, max: 1500 },
                  { label: "Above Rs. 1,500", min: 1500, max: 10000 },
                ].map((range, i) => (
                  <Link
                    key={i}
                    href={`/shop?${categorySlug ? `category=${categorySlug}&` : ""}minPrice=${range.min}&maxPrice=${range.max}`}
                    className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-brand-cream hover:text-brand-dark transition-colors"
                  >
                    {range.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3 space-y-8">
          {/* Active Filter Chips */}
          {(categorySlug || query || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 items-center bg-brand-cream/50 p-3 rounded-xl border border-brand-light/20">
              <span className="text-xs font-bold text-slate-600">Active Filters:</span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-brand-dark border border-brand-light/30 rounded-full text-xs font-bold shadow-xs">
                  Category: {activeCategory.name}
                  <Link href={`/shop?${query ? `q=${query}` : ""}`}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </Link>
                </span>
              )}
              {query && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-brand-dark border border-brand-light/30 rounded-full text-xs font-bold shadow-xs">
                  Search: "{query}"
                  <Link href={`/shop?${categorySlug ? `category=${categorySlug}` : ""}`}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </Link>
                </span>
              )}
            </div>
          )}

          {products.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any products matching your selected filters. Try broadening your criteria or reset filters.
              </p>
              <Link href="/shop">
                <Button variant="primary" size="sm">Reset Filters</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <Link
                    key={pageNum}
                    href={`/shop?${categorySlug ? `category=${categorySlug}&` : ""}${query ? `q=${query}&` : ""}page=${pageNum}`}
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                      currentPage === pageNum
                        ? "bg-brand-dark text-white shadow-soft"
                        : "bg-white text-slate-700 hover:bg-brand-cream border border-slate-200"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
