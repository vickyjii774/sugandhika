"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SortDropdown({ sortBy }: { sortBy: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      value={sortBy}
      onChange={handleChange}
      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-dark cursor-pointer"
    >
      <option value="newest">Newest Arrivals</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
    </select>
  );
}
