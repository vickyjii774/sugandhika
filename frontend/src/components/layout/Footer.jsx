import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { navigationService } from '../../services/api.service.js';
import { MapPin, Phone, Mail, Sparkles, Facebook, Instagram, Youtube, ArrowRight } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.js';

const quickLinks = [
  { label: 'Home', to: '/' }, { label: 'About Us', to: '/about' }, { label: 'Products', to: '/products' },
  { label: 'Our Team', to: '/team' }, { label: 'Gallery', to: '/gallery' }, { label: 'FAQ', to: '/faq' }, { label: 'Contact Us', to: '/contact' },
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
  const [links, setLinks] = useState(quickLinks);
  useEffect(() => { navigationService.getPublic().then(res => { const items = Array.isArray(res?.data) ? res.data : []; if (items.length) setLinks(items.map(item => ({ label: item.label, to: item.url }))); }).catch(() => {}); }, []);
  const year = new Date().getFullYear();
  const phone = settings?.phone || '';
  const whatsapp = settings?.whatsapp || phone;
  return (
    <footer className="bg-brand-dark text-white">
   
<div className="border-b border-white/10 py-6 sm:py-8">
  <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 grid grid-cols-3 gap-2 sm:gap-6">

    {[
      {
        icon: '',
        title: '100% Natural Ingredients',
        desc: 'Pure plant extracts and natural ingredients'
      },
      {
        icon: '',
        title: 'Quality Assured',
        desc: 'Carefully crafted for everyday use'
      },
      {
        icon: '',
        title: 'Himalayan Crafted',
        desc: "Inspired by Nepal's botanical heritage"
      }
    ].map(item => (
      <div key={item.title} className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 min-w-0">

        <span className="text-xl sm:text-3xl shrink-0">
          {item.icon}
        </span>

        <div className="min-w-0">
          <h4 className="text-[10px] sm:text-sm font-semibold leading-tight">
            {item.title}
          </h4>

          <p className="text-[8px] sm:text-xs text-white/60 mt-1 leading-relaxed">
            {item.desc}
          </p>
        </div>

      </div>
    ))}

  </div>
</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">{settings?.logo ? <img src={settings.logo} alt="" className="w-10 h-10 object-contain" /> : <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-brand-gold" /></div>}<div><div className="font-serif font-bold text-lg">{settings?.siteName || 'Sugandhika'}</div><div className="text-[10px] tracking-widest uppercase text-brand-light">{settings?.tagline || 'Pure Eco Fragrance'}</div></div></Link>
          <p className="text-sm text-white leading-relaxed mb-5">{settings?.description || "Bringing Nepal's natural heritage and modern living together through thoughtfully crafted herbal fragrances."}</p>
          <div className="space-y-2.5 text-sm text-white">
            {settings?.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0 text-brand-light" />{settings.address}</div>}
            {phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-brand-light" /><a href={`tel:${phone}`} className="hover:text-white">{phone}</a></div>}
            {settings?.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-brand-light" /><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></div>}
          </div>
          <div className="flex gap-3 mt-5">{settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"><Facebook className="w-4 h-4" /></a>}{settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"><Instagram className="w-4 h-4" /></a>}{settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"><Youtube className="w-4 h-4" /></a>}</div>
        </div>
        <div><h4 className="text-sm font-semibold uppercase tracking-wider mb-5">Quick Links</h4><ul className="space-y-2.5">{links.map(l => <li key={l.to}><Link to={l.to} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white hover:text-white/40 flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-brand-light" />{l.label}</Link></li>)}</ul></div>
        <div><h4 className="text-sm font-semibold uppercase tracking-wider mb-5">Our Products</h4><ul className="space-y-2.5">{productLinks.map(l => <li key={l.to}><Link to={l.to} className="text-sm text-white hover:text-white/40 flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-brand-light" />{l.label}</Link></li>)}</ul></div>
      </div>
      <div className="border-t border-white/10 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-white text-center"><span>{settings?.copyright || `© ${year} ${settings?.siteName || 'Sugandhika'}. All rights reserved.`}</span></div></div>
    </footer>
  );
}
