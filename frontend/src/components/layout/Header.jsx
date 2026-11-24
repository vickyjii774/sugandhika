import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
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

        <div className="flex items-center justify-between gap-4 sm:gap-6 lg:gap-8 min-h-[58px] sm:min-h-[72px] py-2">

      
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
          <nav className="flex items-center justify-end gap-3 sm:gap-6 lg:gap-8 text-[11px] sm:text-base font-medium flex-1 min-w-0">

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
              href={`https://wa.me/${String(whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(
                'Hello Sugandhika, I would like to inquire about your products.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Sugandhika on WhatsApp"
              className="flex items-center justify-center gap-1 sm:gap-2 p-2.5 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-[8px] sm:text-sm font-semibold rounded-md sm:rounded-xl shrink-0 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-4 sm:h-4 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          )}

        </div>
      </div>
    </header>
  );
}
