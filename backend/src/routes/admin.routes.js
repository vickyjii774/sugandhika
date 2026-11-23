import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

import * as settings from '../controllers/settings.controller.js';
import * as navigation from '../controllers/navigation.controller.js';
import * as homepage from '../controllers/homepage.controller.js';
import * as banners from '../controllers/banners.controller.js';
import * as features from '../controllers/features.controller.js';
import * as categories from '../controllers/categories.controller.js';
import * as products from '../controllers/products.controller.js';
import * as about from '../controllers/about.controller.js';
import * as team from '../controllers/team.controller.js';
import * as gallery from '../controllers/gallery.controller.js';
import * as faq from '../controllers/faq.controller.js';
import * as contact from '../controllers/contact.controller.js';
import * as seo from '../controllers/seo.controller.js';
import * as users from '../controllers/users.controller.js';
import * as auditlog from '../controllers/auditlog.controller.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

const isSuperAdmin = requireRole('SUPER_ADMIN');
const isAdmin = requireRole('SUPER_ADMIN', 'CONTENT_ADMIN');
const isEditor = requireRole('SUPER_ADMIN', 'CONTENT_ADMIN', 'EDITOR');

// ── Settings ──────────────────────────────────────────────────────────────────
router.put('/settings', isSuperAdmin, settings.updateSettings);
router.post('/settings/logo', isSuperAdmin, upload.single('image'), settings.uploadLogo);
router.post('/settings/favicon', isSuperAdmin, upload.single('image'), settings.uploadFavicon);

// ── Navigation ────────────────────────────────────────────────────────────────
router.get('/navigation', isEditor, navigation.getAllNavigation);
router.post('/navigation', isAdmin, navigation.createNavItem);
router.put('/navigation/reorder', isAdmin, navigation.reorderNavItems);
router.put('/navigation/:id', isAdmin, navigation.updateNavItem);
router.delete('/navigation/:id', isAdmin, navigation.deleteNavItem);

// ── Homepage ──────────────────────────────────────────────────────────────────
router.put('/homepage/sections/reorder', isAdmin, homepage.reorderSections);
router.put('/homepage/sections/:key', isAdmin, homepage.updateSection);

// ── Banners ───────────────────────────────────────────────────────────────────
router.get('/banners', isEditor, banners.getAllBanners);
router.post('/banners', isAdmin, upload.single('image'), banners.createBanner);
router.put('/banners/reorder', isAdmin, banners.reorderBanners);
router.put('/banners/:id', isAdmin, upload.single('image'), banners.updateBanner);
router.delete('/banners/:id', isAdmin, banners.deleteBanner);

// ── Features ──────────────────────────────────────────────────────────────────
router.get('/features', isEditor, features.getAllFeatures);
router.post('/features', isAdmin, features.createFeature);
router.put('/features/reorder', isAdmin, features.reorderFeatures);
router.put('/features/:id', isAdmin, features.updateFeature);
router.delete('/features/:id', isAdmin, features.deleteFeature);

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories', isEditor, categories.getAllCategories);
router.post('/categories', isAdmin, upload.single('image'), categories.createCategory);
router.put('/categories/reorder', isAdmin, categories.reorderCategories);
router.put('/categories/:id', isAdmin, upload.single('image'), categories.updateCategory);
router.delete('/categories/:id', isAdmin, categories.deleteCategory);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products', isEditor, products.getAllProducts);
router.get('/products/:id', isEditor, products.getProductById);
router.patch('/products/:id/featured', isAdmin, products.toggleFeatured);
router.post('/products', isAdmin, upload.single('mainImage'), products.createProduct);
router.post('/products/:id/image', isAdmin, upload.single('image'), products.uploadProductMainImage);
router.put('/products/:id/publish', isAdmin, products.togglePublish);
router.post('/products/:id/images', isAdmin, upload.array('images', 10), products.uploadProductImages);
router.delete('/products/:id/images/:imageId', isAdmin, products.deleteProductImage);
router.put('/products/:id', isAdmin, upload.single('mainImage'), products.updateProduct);
router.delete('/products/:id', isAdmin, products.deleteProduct);

// ── About ─────────────────────────────────────────────────────────────────────
router.put('/about', isEditor, about.updateAboutPage);
router.post('/about/image', isAdmin, upload.single('image'), about.uploadAboutImage);

// ── Team ──────────────────────────────────────────────────────────────────────
router.get('/team', isEditor, team.getAllTeam);
router.get('/team/:id', isEditor, team.getTeamMemberById);
router.patch('/team/:id/featured', isAdmin, team.toggleTeamFeatured);
router.patch('/team/:id/publish', isAdmin, team.toggleTeamPublish);
router.post('/team', isAdmin, upload.single('image'), team.createMember);
router.put('/team/reorder', isAdmin, team.reorderTeam);
router.put('/team/:id', isAdmin, upload.single('image'), team.updateMember);
router.delete('/team/:id', isAdmin, team.deleteMember);

// ── Gallery ───────────────────────────────────────────────────────────────────
router.get('/gallery/albums', isEditor, gallery.getAllAlbums);
router.get('/gallery/albums/:id', isEditor, gallery.getAlbumById);
router.post('/gallery/albums', isAdmin, upload.single('cover'), gallery.createAlbum);
router.put('/gallery/albums/:id', isAdmin, upload.single('cover'), gallery.updateAlbum);
router.delete('/gallery/albums/:id', isAdmin, gallery.deleteAlbum);
router.post('/gallery/albums/:id/images', isAdmin, upload.array('images', 20), gallery.uploadImages);
router.put('/gallery/albums/:id/reorder', isAdmin, gallery.reorderImages);
router.delete('/gallery/images/:id', isAdmin, gallery.deleteImage);

// ── FAQ ───────────────────────────────────────────────────────────────────────
router.get('/faq', isEditor, faq.getAllFAQs);
router.get('/faq/:id', isEditor, faq.getFAQById);
router.patch('/faq/:id/featured', isAdmin, faq.toggleFAQFeatured);
router.patch('/faq/:id/publish', isAdmin, faq.toggleFAQPublish);
router.post('/faq', isAdmin, faq.createFAQ);
router.put('/faq/reorder', isAdmin, faq.reorderFAQs);
router.put('/faq/:id', isAdmin, faq.updateFAQ);
router.delete('/faq/:id', isAdmin, faq.deleteFAQ);

router.get('/faq-categories', isEditor, faq.getAllFAQCategories);
router.post('/faq-categories', isAdmin, faq.createFAQCategory);
router.put('/faq-categories/:id', isAdmin, faq.updateFAQCategory);
router.delete('/faq-categories/:id', isAdmin, faq.deleteFAQCategory);

// ── Contact ───────────────────────────────────────────────────────────────────
router.put('/contact', isAdmin, contact.updateContactInfo);

// ── SEO ───────────────────────────────────────────────────────────────────────
router.get('/seo', isAdmin, seo.getAllSEO);
router.put('/seo/:pageKey', isAdmin, seo.updateSEO);

// ── Users (Super Admin only) ──────────────────────────────────────────────────
router.get('/users', isSuperAdmin, users.getAllUsers);
router.get('/users/:id', isSuperAdmin, users.getUserById);
router.post('/users', isSuperAdmin, users.createUser);
router.put('/users/:id', isSuperAdmin, users.updateUser);
router.delete('/users/:id', isSuperAdmin, users.deleteUser);

// ── Audit Log ─────────────────────────────────────────────────────────────────
router.get('/audit-logs', isSuperAdmin, auditlog.getAuditLogs);

export default router;
