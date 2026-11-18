import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Sparkles, Facebook, Instagram, Youtube, ArrowRight } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.js';

const quickLinks = [
  { label: 'Home', to: '/' }, { label: 'About Us', to: '/about' },
  { label: 'Products', to: '/products' }, { label: 'Our Team', to: '/team' },
  { label: 'Gallery', to: '/gallery' }, { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact' },
];
const productLinks = [
  { label: 'Mosquito Killer Sticks', to: '/products?category=mosquito-killer-sticks' },
  { label: 'Mosquito Powder', to: '/products?category=mosquito-powder' },
  { label: 'Mosquito Liquid', to: '/products?category=mosquito-liquid' },
  { label: 'Natural Air Freshener', to: '/products?category=natural-air-freshener' },
  { label: 'Herbal Incense', to: '/products?category=herbal-incense' },
  { label: 'Gift Packs', to: '/products?category=gift-packs' },
];

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-white">
      {/* Top bar */}
      <div className="border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🌿', title: '100% Natural Ingredients', desc: 'Pure plant extracts, no synthetic chemicals' },
            { icon: '🛡️', title: 'Safe for Family', desc: 'Carefully crafted for everyday use around children & pets' },
            { icon: '🏔️', title: 'Himalayan Crafted', desc: "Inspired by Nepal's natural botanical heritage" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h4 className="text-sm font-semibold">{item.title}</h4>
                <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <div className="font-serif font-bold text-lg">Sugandhika</div>
              <div className="text-[10px] tracking-widest uppercase text-brand-light">Pure Eco Fragrance</div>
            </div>
          </Link>
          <p className="text-sm text-white/60 leading-relaxed mb-5">
            {settings?.description || "Bringing Nepal's natural heritage and modern living together through thoughtfully crafted herbal fragrances."}
          </p>
          <div className="space-y-2.5 text-sm text-white/60">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0 text-brand-light" />{settings?.address || 'Lazimpat, Kathmandu, Nepal'}</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-brand-light" /><a href={`tel:${settings?.phone}`} className="hover:text-white transition-colors">{settings?.phone || '+977-1-XXXXXXX'}</a></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-brand-light" /><a href={`mailto:${settings?.email}`} className="hover:text-white transition-colors">{settings?.email || 'info@sugandhika.com'}</a></div>
          </div>
          {/* Social */}
          <div className="flex gap-3 mt-5">
            {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-brand rounded-lg flex items-center justify-center transition-colors"><Facebook className="w-4 h-4" /></a>}
            {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-brand rounded-lg flex items-center justify-center transition-colors"><Instagram className="w-4 h-4" /></a>}
            {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-brand rounded-lg flex items-center justify-center transition-colors"><Youtube className="w-4 h-4" /></a>}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">Quick Links</h4>
          <ul className="space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.to}><Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-brand-light" />{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Products */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">Our Products</h4>
          <ul className="space-y-2.5">
            {productLinks.map((l) => (
              <li key={l.to}><Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-brand-light" />{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact / WhatsApp CTA */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">Order via WhatsApp</h4>
          <p className="text-sm text-white/60 mb-4">The easiest way to place your order is via WhatsApp. We respond quickly!</p>
          <a
            href={`https://wa.me/${settings?.whatsapp || '9779801234567'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            💬 Order on WhatsApp
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>{settings?.copyright || `© ${year} Sugandhika. All rights reserved.`}</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
