import { api } from '../utils/api.js';

const TOKEN_KEY = 'sugandhika_admin_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);

// Public reads stay on public endpoints. Admin mutations always use /admin.
export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/admin/settings', data, getToken()),
  uploadLogo: (formData) => api.upload('/admin/settings/logo', formData, getToken()),
  uploadFavicon: (formData) => api.upload('/admin/settings/favicon', formData, getToken()),
};

export const navigationService = {
  getPublic: () => api.get('/navigation'),
  getAdmin: () => api.get('/admin/navigation', getToken()),
  create: (data) => api.post('/admin/navigation', data, getToken()),
  update: (id, data) => api.put(`/admin/navigation/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/navigation/${id}`, getToken()),
  reorder: (data) => api.put('/admin/navigation/reorder', data, getToken()),
};

export const homepageService = {
  getAll: () => api.get('/homepage'),
  getBanners: () => api.get('/admin/banners', getToken()),
  updateSection: (section, data) =>
    api.put(`/admin/homepage/sections/${section}`, data, getToken()),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data, getToken()),
  createBanner: (data) => api.post('/admin/banners', data, getToken()),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`, getToken()),
  reorderBanners: (data) => api.put('/admin/banners/reorder', data, getToken()),
  reorderSections: (data) =>
    api.put('/admin/homepage/sections/reorder', data, getToken()),
};

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
  uploadImage: (id, formData) =>
    api.upload(`/admin/products/${id}/image`, formData, getToken()),
  uploadImages: (id, formData) =>
    api.upload(`/admin/products/${id}/images`, formData, getToken()),
  deleteImage: (id, imageId) =>
    api.delete(`/admin/products/${id}/images/${imageId}`, getToken()),
  togglePublish: (id) =>
    api.put(`/admin/products/${id}/publish`, {}, getToken()),
  toggleFeatured: (id) =>
    api.patch(`/admin/products/${id}/featured`, {}, getToken()),
};

export const categoriesService = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  adminGetAll: () => api.get('/admin/categories', getToken()),
  create: (data) => api.post('/admin/categories', data, getToken()),
  update: (id, data) => api.put(`/admin/categories/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/categories/${id}`, getToken()),
  uploadImage: (id, formData) =>
    api.uploadPut(`/admin/categories/${id}`, formData, getToken()),
  reorder: (data) => api.put('/admin/categories/reorder', data, getToken()),
};

export const aboutService = {
  get: () => api.get('/about'),
  update: (data) => api.put('/admin/about', data, getToken()),
  uploadImage: (formData) => api.upload('/admin/about/image', formData, getToken()),
};

export const teamService = {
  getAll: () => api.get('/team'),
  getFeatured: () => api.get('/team/featured'),
  adminGetAll: () => api.get('/admin/team', getToken()),
  getById: (id) => api.get(`/admin/team/${id}`, getToken()),
  create: (data) => api.post('/admin/team', data, getToken()),
  update: (id, data) => api.put(`/admin/team/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/team/${id}`, getToken()),
  uploadPhoto: (id, formData) =>
    api.uploadPut(`/admin/team/${id}`, formData, getToken()),
  reorder: (data) => api.put('/admin/team/reorder', data, getToken()),
  toggleFeatured: (id) =>
    api.patch(`/admin/team/${id}/featured`, {}, getToken()),
  togglePublish: (id) =>
    api.patch(`/admin/team/${id}/publish`, {}, getToken()),
};

export const galleryService = {
  getAlbums: () => api.get('/gallery'),
  getAlbum: (slug) => api.get(`/gallery/${slug}`),
  getFeatured: () => api.get('/gallery/featured'),
  adminGetAlbums: () => api.get('/admin/gallery/albums', getToken()),
  getAlbumById: (id) => api.get(`/admin/gallery/albums/${id}`, getToken()),
  createAlbum: (data) => api.post('/admin/gallery/albums', data, getToken()),
  updateAlbum: (id, data) =>
    api.put(`/admin/gallery/albums/${id}`, data, getToken()),
  deleteAlbum: (id) =>
    api.delete(`/admin/gallery/albums/${id}`, getToken()),
  uploadCover: (id, formData) =>
    api.uploadPut(`/admin/gallery/albums/${id}`, formData, getToken()),
  uploadImages: (id, formData) =>
    api.upload(`/admin/gallery/albums/${id}/images`, formData, getToken()),
  addImageUrl: (id, data) => api.post(`/admin/gallery/albums/${id}/images/url`, data, getToken()),
  deleteImage: (_albumId, imageId) =>
    api.delete(`/admin/gallery/images/${imageId}`, getToken()),
  reorderImages: (albumId, data) =>
    api.put(`/admin/gallery/albums/${albumId}/reorder`, data, getToken()),
};

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
  toggleFeatured: (id) =>
    api.patch(`/admin/faq/${id}/featured`, {}, getToken()),
  togglePublish: (id) =>
    api.patch(`/admin/faq/${id}/publish`, {}, getToken()),
};

export const faqCategoriesService = {
  getAll: () => api.get('/admin/faq-categories', getToken()),
  create: (data) => api.post('/admin/faq-categories', data, getToken()),
  update: (id, data) =>
    api.put(`/admin/faq-categories/${id}`, data, getToken()),
  delete: (id) =>
    api.delete(`/admin/faq-categories/${id}`, getToken()),
};

export const contactService = {
  get: () => api.get('/contact'),
  update: (data) => api.put('/admin/contact', data, getToken()),
  submit: (data) => api.post('/contact/submit', data),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout', {}, getToken()),
  getMe: () => api.get('/auth/me', getToken()),
  changePassword: (data) => api.post('/auth/change-password', data, getToken()),
};

export const usersService = {
  getAll: () => api.get('/admin/users', getToken()),
  getById: (id) => api.get(`/admin/users/${id}`, getToken()),
  create: (data) => api.post('/admin/users', data, getToken()),
  update: (id, data) => api.put(`/admin/users/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/users/${id}`, getToken()),
};

export const seoService = {
  getAll: () => api.get('/admin/seo', getToken()),
  update: (page, data) => api.put(`/admin/seo/${page}`, data, getToken()),
};


export const featuresService = {
  getPublic: () => api.get('/features'),
  getAll: () => api.get('/admin/features', getToken()),
  create: (data) => api.post('/admin/features', data, getToken()),
  update: (id, data) => api.put(`/admin/features/${id}`, data, getToken()),
  delete: (id) => api.delete(`/admin/features/${id}`, getToken()),
  reorder: (data) => api.put('/admin/features/reorder', data, getToken()),
};
