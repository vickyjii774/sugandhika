import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Phone, Sparkles, ChevronDown } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { useWishlist } from '../../hooks/useWishlist.js';
import { useSettings } from '../../hooks/useSettings.js';
import { openWhatsApp } from '../../utils/whatsapp.js';

const DEFAULT_NAV = [
  { label: 'Home', url: '/' },
  { label: 'About Us', url: '/about' },
  { label: 'Products', url: '/products' },
  { label: 'Our Team', url: '/team' },
  { label: 'Gallery', url: '/gallery' },
  { label: 'FAQ', url: '/faq' },
  { label: 'Contact Us', url: '/contact' },
];

export default function Header() {
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsappNumber = settings?.whatsapp || '9779801234567';

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-soft' : 'bg-white/95 backdrop-blur-md border-b border-brand-cream'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center shadow-green group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <div className="font-serif font-bold text-xl text-brand-dark leading-none">Sugandhika</div>
              <div className="text-[10px] tracking-widest uppercase text-brand font-semibold">Pure Eco Fragrance</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {DEFAULT_NAV.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === '/'}
                className={({ isActive }) =>
                  `transition-colors hover:text-brand-dark ${isActive ? 'text-brand-dark font-semibold' : 'text-gray-600'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2.5 rounded-xl text-gray-600 hover:text-brand-dark hover:bg-brand-cream transition-all">
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-xl text-gray-600 hover:text-brand-dark hover:bg-brand-cream transition-all">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* WhatsApp */}
            <button
              onClick={() => openWhatsApp(whatsappNumber, 'Hello Sugandhika, I would like to inquire about your products.')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all shadow-soft"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {/* Mobile menu toggle */}
            <button className="lg:hidden p-2.5 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-cream bg-white">
          <nav className="px-4 py-4 space-y-1">
            {DEFAULT_NAV.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-cream text-brand-dark font-semibold' : 'text-gray-700 hover:bg-brand-cream'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => { openWhatsApp(whatsappNumber, 'Hello Sugandhika!'); setMobileOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-lg mt-2"
            >
              <Phone className="w-4 h-4" /> WhatsApp Us
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
