import { api } from '../utils/api.js';

const TOKEN_KEY = 'sugandhika_admin_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);

// ─── Settings ───────────────────────────────────────────────
export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data, getToken()),
  uploadLogo: (formData) => api.upload('/settings/logo', formData, getToken()),
  uploadFavicon: (formData) => api.upload('/settings/favicon', formData, getToken()),
};

// ─── Navigation ─────────────────────────────────────────────
export const navigationService = {
  getPublic: () => api.get('/navigation'),
  getAdmin: () => api.get('/navigation/all', getToken()),
  create: (data) => api.post('/navigation', data, getToken()),
  update: (id, data) => api.put(`/navigation/${id}`, data, getToken()),
  delete: (id) => api.delete(`/navigation/${id}`, getToken()),
  reorder: (data) => api.put('/navigation/reorder', data, getToken()),
};

// ─── Homepage ────────────────────────────────────────────────
export const homepageService = {
  getAll: () => api.get('/homepage'),
  updateSection: (section, data) => api.put(`/homepage/${section}`, data, getToken()),
  updateBanner: (id, data) => api.put(`/homepage/banners/${id}`, data, getToken()),
  createBanner: (data) => api.post('/homepage/banners', data, getToken()),
  deleteBanner: (id) => api.delete(`/homepage/banners/${id}`, getToken()),
  uploadBannerImage: (formData) => api.upload('/homepage/banners/image', formData, getToken()),
  reorderSections: (data) => api.put('/homepage/reorder', data, getToken()),
};

// ─── Products ────────────────────────────────────────────────
export const productsService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/products${query ? `?${query}` : ''}`);
  },
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getRelated: (slug) => api.get(`/products/${slug}/related`),
  adminGetAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/products${query ? `?${query}` : ''}`, getToken());
  },
  getById: (id) => api.get(`/admin/products/${id}`, getToken()),
  create: (data) => api.post('/admin/products', data, getToken()),
  update: (id, data) => api.put(`/admin/products/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/products/${id}`, getToken()),
  uploadImage: (id, formData) => api.upload(`/admin/products/${id}/image`, formData, getToken()),
  uploadImages: (id, formData) => api.upload(`/admin/products/${id}/images`, formData, getToken()),
  togglePublish: (id) => api.patch(`/admin/products/${id}/publish`, {}, getToken()),
  toggleFeatured: (id) => api.patch(`/admin/products/${id}/featured`, {}, getToken()),
};

// ─── Categories ──────────────────────────────────────────────
export const categoriesService = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  adminGetAll: () => api.get('/admin/categories', getToken()),
  create: (data) => api.post('/admin/categories', data, getToken()),
  update: (id, data) => api.put(`/admin/categories/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/categories/${id}`, getToken()),
  uploadImage: (id, formData) => api.upload(`/admin/categories/${id}/image`, formData, getToken()),
  reorder: (data) => api.put('/admin/categories/reorder', data, getToken()),
};

// ─── About ───────────────────────────────────────────────────
export const aboutService = {
  get: () => api.get('/about'),
  update: (data) => api.put('/about', data, getToken()),
  uploadImage: (formData) => api.upload('/about/image', formData, getToken()),
};

// ─── Team ────────────────────────────────────────────────────
export const teamService = {
  getAll: () => api.get('/team'),
  getFeatured: () => api.get('/team/featured'),
  adminGetAll: () => api.get('/admin/team', getToken()),
  getById: (id) => api.get(`/admin/team/${id}`, getToken()),
  create: (data) => api.post('/admin/team', data, getToken()),
  update: (id, data) => api.put(`/admin/team/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/team/${id}`, getToken()),
  uploadPhoto: (id, formData) => api.upload(`/admin/team/${id}/photo`, formData, getToken()),
  reorder: (data) => api.put('/admin/team/reorder', data, getToken()),
  toggleFeatured: (id) => api.patch(`/admin/team/${id}/featured`, {}, getToken()),
  togglePublish: (id) => api.patch(`/admin/team/${id}/publish`, {}, getToken()),
};

// ─── Gallery ─────────────────────────────────────────────────
export const galleryService = {
  getAlbums: () => api.get('/gallery'),
  getAlbum: (slug) => api.get(`/gallery/${slug}`),
  getFeatured: () => api.get('/gallery/featured'),
  adminGetAlbums: () => api.get('/admin/gallery', getToken()),
  getAlbumById: (id) => api.get(`/admin/gallery/${id}`, getToken()),
  createAlbum: (data) => api.post('/admin/gallery', data, getToken()),
  updateAlbum: (id, data) => api.put(`/admin/gallery/${id}`, data, getToken()),
  deleteAlbum: (id) => api.delete(`/admin/gallery/${id}`, getToken()),
  uploadCover: (id, formData) => api.upload(`/admin/gallery/${id}/cover`, formData, getToken()),
  uploadImages: (id, formData) => api.upload(`/admin/gallery/${id}/images`, formData, getToken()),
  deleteImage: (albumId, imageId) => api.delete(`/admin/gallery/${albumId}/images/${imageId}`, getToken()),
  reorderImages: (albumId, data) => api.put(`/admin/gallery/${albumId}/reorder`, data, getToken()),
};

// ─── FAQ ─────────────────────────────────────────────────────
export const faqService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/faq${query ? `?${query}` : ''}`);
  },
  getFeatured: () => api.get('/faq/featured'),
  adminGetAll: () => api.get('/admin/faq', getToken()),
  getById: (id) => api.get(`/admin/faq/${id}`, getToken()),
  create: (data) => api.post('/admin/faq', data, getToken()),
  update: (id, data) => api.put(`/admin/faq/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/faq/${id}`, getToken()),
  reorder: (data) => api.put('/admin/faq/reorder', data, getToken()),
  toggleFeatured: (id) => api.patch(`/admin/faq/${id}/featured`, {}, getToken()),
  togglePublish: (id) => api.patch(`/admin/faq/${id}/publish`, {}, getToken()),
};

// ─── Contact ─────────────────────────────────────────────────
export const contactService = {
  get: () => api.get('/contact'),
  update: (data) => api.put('/contact', data, getToken()),
  submit: (data) => api.post('/contact/submit', data),
};

// ─── Auth ────────────────────────────────────────────────────
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout', {}, getToken()),
  getMe: () => api.get('/auth/me', getToken()),
  changePassword: (data) => api.put('/auth/change-password', data, getToken()),
};

// ─── Admin Users ─────────────────────────────────────────────
export const usersService = {
  getAll: () => api.get('/admin/users', getToken()),
  getById: (id) => api.get(`/admin/users/${id}`, getToken()),
  create: (data) => api.post('/admin/users', data, getToken()),
  update: (id, data) => api.put(`/admin/users/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/users/${id}`, getToken()),
};

// ─── SEO ─────────────────────────────────────────────────────
export const seoService = {
  getAll: () => api.get('/admin/seo', getToken()),
  update: (page, data) => api.put(`/admin/seo/${page}`, data, getToken()),
};
