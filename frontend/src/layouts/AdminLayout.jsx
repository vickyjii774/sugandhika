import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, Home, Package, Tag, Users, Image, HelpCircle,
  Navigation, Settings, LogOut, ChevronRight, Sparkles,
  Info, Star, Menu
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/homepage', label: 'Homepage', icon: Home },
  { to: '/admin/banners', label: 'Banners', icon: Star },
  { to: '/admin/features', label: 'Why Choose Us', icon: Star },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/about', label: 'About Us', icon: Info },
  { to: '/admin/team', label: 'Our Team', icon: Users },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
  { to: '/admin/faq', label: 'FAQs', icon: HelpCircle },
  { to: '/admin/navigation', label: 'Navigation', icon: Navigation },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-dark text-white flex flex-col transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-brand-gold" />
          <div>
            <div className="font-serif font-bold text-lg">Sugandhika</div>
            <div className="text-xs text-brand-light">Admin CMS</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-brand text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/50 mb-2">{currentUser?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-dark hover:underline flex items-center gap-1">
            View Site <ChevronRight className="w-3 h-3" />
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
