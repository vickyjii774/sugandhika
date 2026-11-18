/**
 * Central API client for the Sugandhika Django backend.
 *
 * Usage:
 *   import { api } from '@/lib/api/client';
 *   const products = await api.get('/products/');
 *
 * The base URL is read from NEXT_PUBLIC_API_BASE_URL at build time.
 * All authenticated calls automatically attach the stored Bearer token.
 * On 401 responses the client attempts a silent refresh; on failure it
 * clears stored tokens and returns the error.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

// Token storage keys (localStorage — client-side only)
const ACCESS_KEY = 'sg_access';
const REFRESH_KEY = 'sg_refresh';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access, refresh) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Silent token refresh ─────────────────────────────────────────────────────

let refreshPromise = null; // prevent concurrent refresh races

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token available');

    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      clearTokens();
      throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();
    setTokens(data.access, data.refresh || null);
    return data.access;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

/**
 * Make a request to the Django API.
 *
 * @param {string} path      - URL path relative to API_BASE (e.g. '/products/')
 * @param {object} [options] - fetch options
 * @param {boolean} [retry]  - internal flag to prevent infinite refresh loops
 */
async function request(path, options = {}, retry = true) {
  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const access = getAccessToken();
  if (access) {
    headers['Authorization'] = `Bearer ${access}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  // Silently refresh JWT on 401 and retry once
  if (response.status === 401 && retry) {
    try {
      const newAccess = await refreshAccessToken();
      return request(path, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newAccess}` },
      }, false);
    } catch {
      clearTokens();
      // Re-throw so callers can redirect to login
      throw new ApiError('Session expired. Please log in again.', 401, {});
    }
  }

  // Parse the response body
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      data?.detail || data?.message || 'Request failed',
      response.status,
      data,
    );
  }

  return data;
}

// ─── ApiError ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── HTTP method helpers ──────────────────────────────────────────────────────

export const api = {
  /** GET /api/v1/{path} */
  get: (path, params) => {
    const url = params ? `${path}?${new URLSearchParams(params)}` : path;
    return request(url, { method: 'GET' });
  },

  /** POST /api/v1/{path} */
  post: (path, body) => request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  /** PATCH /api/v1/{path} */
  patch: (path, body) => request(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),

  /** PUT /api/v1/{path} */
  put: (path, body) => request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  /** DELETE /api/v1/{path} */
  delete: (path) => request(path, { method: 'DELETE' }),
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => api.post('/auth/register/', data),

  login: async (email, password) => {
    const data = await api.post('/auth/token/', { username: email, password });
    setTokens(data.access, data.refresh);
    return data;
  },

  logout: async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await api.post('/auth/token/blacklist/', { refresh });
      } catch {
        // Best-effort blacklist
      }
    }
    clearTokens();
  },

  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/update/', data),
  changePassword: (data) => api.post('/auth/password/change/', data),
  forgotPassword: (email) => api.post('/auth/password/forgot/', { email }),
  resetPassword: (token, new_password) => api.post('/auth/password/reset/', { token, new_password }),

  isAuthenticated: () => Boolean(getAccessToken()),
};

// ─── Store API helpers ────────────────────────────────────────────────────────

export const storeApi = {
  getProducts: (params) => api.get('/products/', params),
  getProductBySlug: (slug) => api.get(`/products/${slug}/`),
  getCategories: (params) => api.get('/categories/', params),
  getFaqs: () => api.get('/faqs/'),
  getTestimonials: () => api.get('/testimonials/'),
  getBanners: () => api.get('/banners/'),
  getStoreSettings: () => api.get('/store-settings/1/'),

  submitReview: (data) => api.post('/reviews/', data),
  submitContact: (data) => api.post('/contact-messages/', data),
  subscribeNewsletter: (email) => api.post('/newsletter-subscribers/', { email }),
};

// ─── Cart API helpers ─────────────────────────────────────────────────────────

export const cartApi = {
  getCart: () => api.get('/cart/'),
  addItem: (product_id, quantity = 1) => api.post('/cart/add/', { product_id, quantity }),
  updateItem: (item_id, quantity) => api.patch(`/cart/update/${item_id}/`, { quantity }),
  removeItem: (item_id) => api.delete(`/cart/remove/${item_id}/`),
  clearCart: () => api.delete('/cart/clear/'),
};

// ─── Wishlist API helpers ─────────────────────────────────────────────────────

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist/'),
  toggle: (product_id) => api.post('/wishlist/toggle/', { product_id }),
  remove: (product_id) => api.delete(`/wishlist/remove/${product_id}/`),
};

// ─── Order / Checkout API helpers ─────────────────────────────────────────────

export const orderApi = {
  checkout: (data) => api.post('/checkout/', data),
  validateCoupon: (code, subtotal) => api.post('/coupons/validate/', { code, subtotal }),
  getMyOrders: () => api.get('/my-orders/'),
  getOrder: (order_number) => api.get(`/my-orders/${order_number}/`),
};

// ─── Address API helpers ──────────────────────────────────────────────────────

export const addressApi = {
  getAddresses: () => api.get('/addresses/'),
  createAddress: (data) => api.post('/addresses/', data),
  updateAddress: (id, data) => api.patch(`/addresses/${id}/`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}/`),
};
