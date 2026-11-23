
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

// Public Pages
import HomePage from '../pages/HomePage.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import TeamPage from '../pages/TeamPage.jsx';
import GalleryPage from '../pages/GalleryPage.jsx';
import GalleryAlbumPage from '../pages/GalleryAlbumPage.jsx';
import FAQPage from '../pages/FAQPage.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

// Admin Pages
import AdminLogin from '../admin/pages/AdminLogin.jsx';
import AdminDashboard from '../admin/pages/AdminDashboard.jsx';
import AdminHomepage from '../admin/pages/AdminHomepage.jsx';
import AdminProducts from '../admin/pages/AdminProducts.jsx';
import AdminProductForm from '../admin/pages/AdminProductForm.jsx';
import AdminCategories from '../admin/pages/AdminCategories.jsx';
import AdminAbout from '../admin/pages/AdminAbout.jsx';
import AdminTeam from '../admin/pages/AdminTeam.jsx';
import AdminGallery from '../admin/pages/AdminGallery.jsx';
import AdminFAQ from '../admin/pages/AdminFAQ.jsx';
import AdminNavigation from '../admin/pages/AdminNavigation.jsx';
import AdminSettings from '../admin/pages/AdminSettings.jsx';
import AdminBanners from '../admin/pages/AdminBanners.jsx';
import AdminFeatures from '../admin/pages/AdminFeatures.jsx';
import AdminRoute from '../admin/components/AdminRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:slug" element={<GalleryAlbumPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="features" element={<AdminFeatures />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="about" element={<AdminAbout />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="faq" element={<AdminFAQ />} />
        <Route path="navigation" element={<AdminNavigation />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
