/**
 * Server-side fetch helpers for Next.js Server Components.
 *
 * Uses native fetch with Next.js cache semantics.
 * Does NOT use localStorage — safe in server components.
 *
 * NEXT_PUBLIC_API_BASE_URL should point to the Django backend:
 *   - development:  http://localhost:8000/api/v1
 *   - staging/prod: https://sugandhika.onrender.com/api/v1
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/$/, '');

/**
 * Core fetch wrapper with error handling and Next.js cache control.
 * Returns parsed JSON or null on error — never throws.
 */
export async function serverFetch(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      next: options.next || { revalidate: 60 },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[serverFetch] ${path} → ${res.status}: ${errText.slice(0, 200)}`);
      return null;
    }
    return res.json();
  } catch (e) {
    console.error(`[serverFetch] ${path}:`, e.message);
    return null;
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * Fetch paginated, filtered product list from Django.
 * Django field names: search, category__slug, price_min, price_max, ordering, is_featured
 */
export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category) qs.set('category__slug', params.category);
  if (params.minPrice !== undefined) qs.set('price_min', String(params.minPrice));
  if (params.maxPrice !== undefined) qs.set('price_max', String(params.maxPrice));
  if (params.ordering) qs.set('ordering', params.ordering);
  if (params.page) qs.set('page', String(params.page));
  if (params.page_size) qs.set('page_size', String(params.page_size));
  if (params.is_featured) qs.set('is_featured', 'true');

  const query = qs.toString();
  const data = await serverFetch(`/products/${query ? '?' + query : ''}`, {
    next: { revalidate: 30 },
  });

  if (!data) return { results: [], count: 0, next: null, previous: null };
  return data;
}

export async function fetchProductBySlug(slug) {
  const data = await serverFetch(`/products/${slug}/`, { next: { revalidate: 30 } });
  return data || null;
}

// ─── Categories ────────────────────────────────────────────────────────────────

export async function fetchCategories(params = {}) {
  const qs = new URLSearchParams();
  if (params.is_active !== false) qs.set('is_active', 'true');
  const data = await serverFetch(`/categories/?${qs}`, { next: { revalidate: 120 } });
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results || []);
}

// ─── Banners ───────────────────────────────────────────────────────────────────

export async function fetchBanners() {
  const data = await serverFetch('/banners/', { next: { revalidate: 120 } });
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results || []);
}

// ─── Testimonials ──────────────────────────────────────────────────────────────

export async function fetchTestimonials() {
  const data = await serverFetch('/testimonials/', { next: { revalidate: 120 } });
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results || []);
}

// ─── FAQs ──────────────────────────────────────────────────────────────────────

export async function fetchFAQs() {
  const data = await serverFetch('/faqs/', { next: { revalidate: 120 } });
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results || []);
}

// ─── Store settings ────────────────────────────────────────────────────────────

export async function fetchStoreSettings() {
  // StoreSettings is a singleton at pk=1 in Django
  return await serverFetch('/store-settings/1/', { next: { revalidate: 300 } });
}

// ─── Compound queries ──────────────────────────────────────────────────────────

/**
 * Fetch all data needed for the homepage in a single parallel call.
 * Normalises field names from Django (snake_case) to the shapes expected by
 * the existing page components.
 */
export async function fetchHomeData() {
  const [banners, categories, featuredResp, testimonials, faqs] = await Promise.all([
    fetchBanners(),
    fetchCategories(),
    fetchProducts({ is_featured: true, page_size: 8 }),
    fetchTestimonials(),
    fetchFAQs(),
  ]);

  const featuredProducts = (featuredResp.results || featuredResp).map(normProduct);

  return {
    banners: banners.map(normBanner),
    categories: categories.map(normCategory),
    featuredProducts,
    testimonials,
    faqs,
  };
}

// ─── Field normalisers (Django → existing component shape) ─────────────────────

/**
 * Normalise a Django banner to the shape the HomePage expects:
 *   { title, subtitle, imageUrl, linkUrl }
 */
function normBanner(b) {
  return {
    ...b,
    imageUrl: b.image_url || b.imageUrl || '',
    linkUrl: b.link_url || b.linkUrl || '/shop',
  };
}

/**
 * Normalise a Django category.
 * The existing components use: cat.image, cat._count.products
 * Django returns:              cat.image_url, cat.product_count
 */
function normCategory(c) {
  return {
    ...c,
    image: c.image_url || c.image || '',
    image_url: c.image_url || '',
    _count: { products: c.product_count || 0 },
  };
}

/**
 * Normalise a Django product to the shape ProductCard expects.
 * ProductCard uses: product.images[0].url, product.compareAtPrice,
 *   product.isFeatured, product.isActive, product.avgRating, product.reviewCount
 */
function normProduct(p) {
  return {
    ...p,
    // camelCase aliases expected by existing components
    compareAtPrice: p.compare_at_price ?? p.compareAtPrice ?? null,
    isFeatured: p.is_featured ?? p.isFeatured ?? false,
    isActive: p.is_active ?? p.isActive ?? true,
    avgRating: p.avg_rating ?? p.avgRating ?? 5,
    reviewCount: p.review_count ?? p.reviewCount ?? 0,
    // Ensure images array has the expected shape
    images: (p.images || []).map(img => ({
      ...img,
      url: img.url || '',
      isPrimary: img.is_primary ?? img.isPrimary ?? false,
    })),
    category: p.category
      ? { ...p.category, name: p.category.name, slug: p.category.slug }
      : { name: '', slug: '' },
  };
}

/**
 * Fetch a single product by slug and normalise it for the PDP.
 */
export async function fetchProductDetail(slug) {
  const p = await fetchProductBySlug(slug);
  if (!p) return null;

  const normed = normProduct(p);

  // Normalise reviews (Django: reviewer_name, reviewer_email, created_at)
  const reviews = (p.customer_reviews || p.reviews || []).map(r => ({
    ...r,
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at || r.createdAt,
    user: {
      name: r.reviewer_name || r.user?.name || 'Customer',
      image: r.user?.image || null,
    },
  }));

  // Fetch related products from the same category
  let relatedProducts = [];
  if (p.category?.slug) {
    const related = await fetchProducts({ category: p.category.slug, page_size: 4 });
    relatedProducts = (related.results || [])
      .filter(rp => rp.id !== p.id)
      .slice(0, 4)
      .map(normProduct);
  }

  return {
    ...normed,
    reviews,
    relatedProducts,
    reviewCount: reviews.length,
    avgRating: reviews.length > 0
      ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
      : 5,
  };
}
