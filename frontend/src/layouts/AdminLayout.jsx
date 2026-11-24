import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutDashboard, Home, Package, Tag, Users, Image, HelpCircle, Navigation, Settings, LogOut, ChevronRight, Sparkles, Info, Star, Menu, X } from 'lucide-react';
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/admin/login'); setSidebarOpen(false); };
  const currentPage = [...navItems].reverse().find(item => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)) || navItems[0];
  return (
    <div className="flex h-screen min-h-dvh bg-gray-50 overflow-hidden">
      {sidebarOpen && <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] bg-brand-dark text-white flex flex-col shadow-2xl transition-transform duration-200 ease-out lg:relative lg:z-auto lg:w-64 lg:shadow-none lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="min-h-[72px] px-4 sm:px-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5 text-brand-gold" /></div><div className="min-w-0"><div className="font-serif font-bold text-lg truncate">Sugandhika</div><div className="text-xs text-brand-light">Admin workspace</div></div></div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center" aria-label="Close menu"><X className="w-5 h-5" /></button>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto overscroll-contain py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 min-h-11 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand text-white shadow-sm' : 'text-white/75 hover:text-white hover:bg-white/10'}`}><Icon className="w-4 h-4 shrink-0" /><span>{label}</span>{location.pathname === to && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-gold" />}</NavLink>)}
        </nav>
        <div className="p-4 border-t border-white/10"><div className="text-xs text-white/60 mb-3 break-all">{currentUser?.email || 'Administrator'}</div><button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full min-h-11 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"><LogOut className="w-4 h-4" /> Sign out</button></div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-3 sm:px-5 lg:px-6 py-3 flex items-center gap-3">
          <button type="button" className="lg:hidden w-10 h-10 -ml-1 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center shrink-0" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" aria-expanded={sidebarOpen}><Menu className="w-5 h-5" /></button>
          <div className="min-w-0 flex-1"><p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-400">Admin workspace</p><h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{currentPage.label}</h1></div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="min-h-10 px-3 sm:px-4 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-brand-dark hover:bg-brand-cream flex items-center gap-1.5 shrink-0">View Site <ChevronRight className="w-3.5 h-3.5" /></a>
        </header>
        <main className="flex-1 min-w-0 overflow-y-auto overscroll-contain p-3 sm:p-5 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
