import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productsService, categoriesService } from '../services/api.service.js';
import ProductCard from '../components/products/ProductCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  useEffect(() => {
    categoriesService.getAll().then(res => {
      setCategories(res.data?.categories || res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { page: currentPage, limit: 12 };
    if (currentCategory) params.category = currentCategory;
    if (currentSearch) params.search = currentSearch;
    if (currentSort === 'featured') params.featured = 'true';
    else if (currentSort) params.sort = currentSort;

    productsService.getAll(params)
      .then(res => {
        const data = res.data || {};
        setProducts(Array.isArray(data.products) ? data.products : []);
        const total = Number(data.total || 0);
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / 12)));
      })
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = currentCategory || currentSearch || currentSort !== 'featured';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Our Products</h1>
          <p className="text-brand-cream/80 text-lg">
            Discover our range of natural herbal wellness products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); updateParam('search', ''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-4 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={currentSort}
              onChange={e => updateParam('sort', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors sm:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`w-56 shrink-0 ${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Categories</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-brand hover:text-brand-dark">
                    Clear all
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory ? 'bg-brand text-white' : 'text-gray-700 hover:bg-brand-cream'}`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateParam('category', cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat.slug ? 'bg-brand text-white' : 'text-gray-700 hover:bg-brand-cream'}`}
                    >
                      {cat.name}
                      {cat._count?.products != null && (
                        <span className="float-right text-xs opacity-70">{cat._count.products}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-24"><LoadingSpinner /></div>
            ) : error ? (
              <div className="text-center py-24 text-red-600">{error}</div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={hasActiveFilters ? 'Try adjusting your filters.' : 'No products available yet.'}
                action={hasActiveFilters ? <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand-dark transition-colors">Clear Filters</button> : null}
              />
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Showing {products.length} of {totalCount} products
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={p => updateParam('page', p.toString())}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
