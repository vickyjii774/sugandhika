import { Router } from 'express';
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

const router = Router();

// Settings (public read)
router.get('/settings', settings.getSettings);

// Navigation (public)
router.get('/navigation', navigation.getPublicNavigation);

// Homepage (public)
router.get('/homepage', homepage.getHomepageData);

// Banners (public)
router.get('/banners', banners.getActiveBanners);

// Features (public)
router.get('/features', features.getActiveFeatures);

// Categories (public)
router.get('/categories', categories.getPublishedCategories);
router.get('/categories/:slug', categories.getCategoryBySlug);

// Products (public)
router.get('/products', products.getPublishedProducts);
router.get('/products/featured', products.getFeaturedProducts);
router.get('/products/:slug', products.getProductBySlug);

// About (public)
router.get('/about', about.getAboutPage);

// Team (public)
router.get('/team', team.getPublishedTeam);
router.get('/team/featured', team.getFeaturedTeam);

// Gallery (public)
router.get('/gallery', gallery.getPublishedAlbums);
router.get('/gallery/featured', gallery.getFeaturedImages);
router.get('/gallery/:slug', gallery.getAlbumBySlug);

// FAQ (public)
router.get('/faq', faq.getPublishedFAQs);
router.get('/faq/featured', faq.getFeaturedFAQs);
router.get('/faq/categories', faq.getFAQCategories);

// Contact (public)
router.get('/contact', contact.getContactInfo);

// SEO (public)
router.get('/seo/:pageKey', seo.getSEOByPage);

export default router;
