import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, Sparkles } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.js';
import { navigationService } from '../../services/api.service.js';
import { openWhatsApp } from '../../utils/whatsapp.js';

const DEFAULT_NAV = [
  { label: 'Home', url: '/' }, { label: 'About Us', url: '/about' },
  { label: 'Products', url: '/products' }, { label: 'Our Team', url: '/team' },
  { label: 'Gallery', url: '/gallery' }, { label: 'FAQ', url: '/faq' },
  { label: 'Contact Us', url: '/contact' },
];

export default function Header() {
  const { settings } = useSettings();
  const [navItems, setNavItems] = useState(DEFAULT_NAV);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    navigationService.getPublic().then(res => {
      const items = Array.isArray(res?.data) ? res.data : [];
      if (items.length) setNavItems(items);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsappNumber = settings?.whatsapp || settings?.phone || '';
  const renderNav = (mobile = false) => navItems.map(item => (
    <NavLink key={item.id || item.url} to={item.url} end={item.url === '/'}
      onClick={mobile ? () => setMobileOpen(false) : undefined}
      className={({ isActive }) => mobile
        ? `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-cream text-brand-dark font-semibold' : 'text-gray-700 hover:bg-brand-cream'}`
        : `transition-colors hover:text-brand-dark ${isActive ? 'text-brand-dark font-semibold' : 'text-gray-600'}`}>
      {item.label}
    </NavLink>
  ));

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-soft' : 'bg-white/95 backdrop-blur-md border-b border-brand-cream'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[72px] py-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            {settings?.logo ? <img src={settings.logo} alt={settings.siteName || 'Sugandhika'} className="w-10 h-10 object-contain" /> : <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center"><Sparkles className="w-5 h-5 text-brand-gold" /></div>}
            <div><div className="font-serif font-bold text-xl text-brand-dark leading-none">{settings?.siteName || 'Sugandhika'}</div><div className="text-[10px] tracking-widest uppercase text-brand font-semibold">{settings?.tagline || 'Pure Eco Fragrance'}</div></div>
          </Link>
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium">{renderNav()}</nav>
          <div className="flex items-center gap-2">
            {whatsappNumber && <button onClick={() => openWhatsApp(whatsappNumber, 'Hello Sugandhika, I would like to inquire about your products.')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl"><Phone className="w-4 h-4" /><span>WhatsApp</span></button>}
            <button className="lg:hidden p-2.5 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
      </div>
      {mobileOpen && <div className="lg:hidden border-t border-brand-cream bg-white"><nav className="px-4 py-4 space-y-1">{renderNav(true)}{whatsappNumber && <button onClick={() => { openWhatsApp(whatsappNumber, 'Hello Sugandhika!'); setMobileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-lg mt-2"><Phone className="w-4 h-4" />WhatsApp Us</button>}</nav></div>}
    </header>
  );
}
