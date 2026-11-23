
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, Sparkles } from 'lucide-react';
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
  const { settings } = useSettings();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsappNumber =
    settings?.whatsapp || '9779801234567';

  const whatsappMessage =
    'Hello Sugandhika, I would like to inquire about your products.';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-soft'
          : 'bg-white/95 backdrop-blur-md border-b border-brand-cream'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center shadow-green group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-brand-gold" />
            </div>

            <div>
              <div className="font-serif font-bold text-xl text-brand-dark leading-none">
                Sugandhika
              </div>

              <div className="text-[10px] tracking-widest uppercase text-brand font-semibold">
                Pure Eco Fragrance
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {DEFAULT_NAV.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === '/'}
                className={({ isActive }) =>
                  `transition-colors hover:text-brand-dark ${
                    isActive
                      ? 'text-brand-dark font-semibold'
                      : 'text-gray-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2">

            {/* WhatsApp */}
            <button
              onClick={() =>
                openWhatsApp(whatsappNumber, whatsappMessage)
              }
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all shadow-soft"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2.5 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
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
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-cream text-brand-dark font-semibold'
                      : 'text-gray-700 hover:bg-brand-cream'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <button
              onClick={() => {
                openWhatsApp(whatsappNumber, 'Hello Sugandhika!');
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-lg mt-2"
            >
              <Phone className="w-4 h-4" />
              WhatsApp Us
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
