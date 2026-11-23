import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Tag,
  Users,
  Image,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import {
  productsService,
  categoriesService,
  teamService,
  galleryService,
  faqService,
} from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

const QUICK_LINKS = [
  { label: 'Products', href: '/admin/products', icon: Package, color: 'bg-green-50 text-green-700' },
  { label: 'Categories', href: '/admin/categories', icon: Tag, color: 'bg-blue-50 text-blue-700' },
  { label: 'Team', href: '/admin/team', icon: Users, color: 'bg-purple-50 text-purple-700' },
  { label: 'Gallery', href: '/admin/gallery', icon: Image, color: 'bg-yellow-50 text-yellow-700' },
  { label: 'FAQs', href: '/admin/faq', icon: HelpCircle, color: 'bg-pink-50 text-pink-700' },
  { label: 'Homepage Sections', href: '/admin/homepage', icon: BarChart2, color: 'bg-indigo-50 text-indigo-700' },
  { label: 'About Us', href: '/admin/about', icon: Image, color: 'bg-amber-50 text-amber-700' },
  { label: 'Navigation', href: '/admin/navigation', icon: ArrowRight, color: 'bg-slate-50 text-slate-700' },
  { label: 'Site Settings', href: '/admin/settings', icon: TrendingUp, color: 'bg-cyan-50 text-cyan-700' },
];

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState({
    products: null,
    categories: null,
    team: null,
    albums: null,
    faqs: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes, teamRes, gallRes, faqRes] = await Promise.allSettled([
          productsService.adminGetAll({ limit: 1 }),
          categoriesService.adminGetAll(),
          teamService.adminGetAll(),
          galleryService.adminGetAlbums(),
          faqService.adminGetAll(),
        ]);

        const getCount = (res) => {
          if (res.status !== 'fulfilled') return '—';
          const d = res.value?.data;
          return (
            d?.total ??
            d?.count ??
            (Array.isArray(d?.items) ? d.items.length : null) ??
            (Array.isArray(d) ? d.length : null) ??
            '—'
          );
        };

        setStats({
          products: getCount(prodRes),
          categories: getCount(catRes),
          team: getCount(teamRes),
          albums: getCount(gallRes),
          faqs: getCount(faqRes),
        });
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-green-500', href: '/admin/products' },
    { label: 'Categories', value: stats.categories, icon: Tag, color: 'bg-blue-500', href: '/admin/categories' },
    { label: 'Team Members', value: stats.team, icon: Users, color: 'bg-purple-500', href: '/admin/team' },
    { label: 'Gallery Albums', value: stats.albums, icon: Image, color: 'bg-yellow-500', href: '/admin/gallery' },
    { label: 'FAQs', value: stats.faqs, icon: HelpCircle, color: 'bg-pink-500', href: '/admin/faq' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Admin'} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's what's happening with your website today.
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.href}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition group"
            >
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-brand transition">
                {card.value ?? <span className="text-gray-400 text-base">Loading…</span>}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-brand" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-brand transition group"
            >
              <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <link.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 group-hover:text-brand transition">
                  Manage {link.label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">View, add, edit, delete</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand transition flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand" /> Recent Activity
        </h2>
        <div className="space-y-3">
          {[
            'Product "Himalayan Herbs" was updated',
            'New FAQ added under General category',
            'Gallery album "Farm Visit 2024" was published',
            'Team member "Dr. Rajan Sharma" was added',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-brand-light flex-shrink-0" />
              <span className="text-sm text-gray-600">{item}</span>
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">Just now</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Full activity log coming soon.
        </p>
      </div>
    </div>
  );
}
