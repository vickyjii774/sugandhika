"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100">
        <form onSubmit={handleSearchSubmit} className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-brand-dark mr-3" />
          <input
            type="text"
            placeholder="Search herbal mosquito sticks, air fresheners, incense..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-4 text-base bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading && (
            <div className="p-8 text-center text-sm text-slate-500">
              Searching organic eco products...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    router.push(`/shop/${product.slug}`);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-cream cursor-pointer transition-colors"
                >
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/100"}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-brand-dark font-bold">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              No products found matching "{query}".
            </div>
          )}

          {!query && (
            <div className="p-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Mosquito Killer Stick",
                  "Air Freshener",
                  "Sandalwood Dhoop",
                  "Combo Pack",
                  "Lavender Spray",
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-cream text-brand-dark hover:bg-brand-light hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-brand-light" /> {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
