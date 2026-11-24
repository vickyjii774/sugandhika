import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Phone, Sparkles } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.js';
import { navigationService } from '../../services/api.service.js';

const DEFAULT_NAV = [
  { label: 'Home', url: '/' },
  { label: 'About Us', url: '/about' },
  { label: 'Products', url: '/products' },
  { label: 'Contact Us', url: '/contact' },
];

export default function Header() {
  const { settings } = useSettings();
  const [navItems, setNavItems] = useState(DEFAULT_NAV);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    navigationService
      .getPublic()
      .then((res) => {
        const items = Array.isArray(res?.data) ? res.data : [];
        if (items.length) setNavItems(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsappNumber =
    settings?.whatsapp || settings?.phone || '';

  const location = useLocation();

// Scroll to top whenever the page route changes
useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
}, [location.pathname]);


  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-soft'
          : 'bg-white/95 backdrop-blur-md border-b border-brand-cream'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">

        <div className="flex items-center justify-between gap-2 min-h-[58px] sm:min-h-[72px] py-2">

      
{/* LOGO AND BRAND */}
<Link
  to="/"
  onClick={() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }}
  className="flex items-center gap-1.5 sm:gap-2.5 shrink-0"
>
  {settings?.logo ? (
    <img
      src={settings.logo}
      alt={settings.siteName || 'Sugandhika'}
      className="w-7 h-7 sm:w-10 sm:h-10 object-contain"
    />
  ) : (
    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-dark flex items-center justify-center">
      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold" />
    </div>
  )}

  <div className="min-w-0">
    <div className="font-serif font-bold text-[11px] sm:text-xl text-brand-dark leading-none whitespace-nowrap">
      {settings?.siteName || 'Sugandhika'}
    </div>

    <div className="text-[6px] sm:text-[10px] tracking-widest uppercase text-brand font-semibold whitespace-nowrap mt-1">
      {settings?.tagline || 'Pure Eco Fragrance'}
    </div>
  </div>
</Link>


          {/* DESKTOP + MOBILE NAVIGATION */}
          <nav className="flex items-center justify-center gap-2 sm:gap-5 lg:gap-7 text-[9px] sm:text-sm font-medium flex-1 min-w-0">

            {navItems.map((item) => (
              <NavLink
                key={item.id || item.url}
                to={item.url}
                end={item.url === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-brand-dark font-bold'
                      : 'text-gray-600 hover:text-brand-dark'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

          </nav>

          {/* WHATSAPP */}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${String(whatsappNumber).replace(/\\D/g, '')}?text=${encodeURIComponent(
                'Hello Sugandhika, I would like to inquire about your products.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Sugandhika on WhatsApp"
              className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-[8px] sm:text-sm font-semibold rounded-md sm:rounded-xl shrink-0 cursor-pointer"
            >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>WhatsApp</span>
            </a>
          )}

        </div>
      </div>
    </header>
  );
}
