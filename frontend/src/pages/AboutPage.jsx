import { useState, useEffect } from 'react';
import { Leaf, Eye, Heart, Recycle, Lightbulb, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aboutService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const VALUES = [
  { icon: Star, title: 'Quality', desc: 'We never compromise on the quality of our ingredients or our processes.' },
  { icon: Leaf, title: 'Integrity', desc: 'Transparency and honesty guide every decision we make.' },
  { icon: Recycle, title: 'Sustainability', desc: 'We care deeply about the planet and choose eco-friendly practices.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Blending ancient wisdom with modern science for superior results.' },
  { icon: Users, title: 'Community', desc: 'Supporting local farmers and artisans who harvest our botanicals.' },
  { icon: Heart, title: 'Excellence', desc: 'Striving for the best in everything - from sourcing to packaging.' },
];
const DEFAULT_STORY = "Sugandhika was born from a deep love for Nepal's botanical treasures. We set out to create a brand that celebrates pure, natural ingredients while supporting local communities and sustainable agriculture.";
const DEFAULT_MISSION = 'To deliver premium-quality natural herbal products that enhance well-being, inspire confidence, and connect people with the healing power of nature.';
const DEFAULT_VISION = "To become Nepal's most trusted natural wellness brand, recognized globally for our commitment to quality, purity, and sustainable botanical practices.";
const DEFAULT_QUALITY = "At Sugandhika, quality is non-negotiable. Every batch of our products undergoes rigorous testing to ensure purity, potency, and safety.";

// Older/admin content can store rich text as { title, description } rather than a string.
const renderableText = (value) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(item => renderableText(item)).filter(Boolean).join('\\n\\n');
  if (value && typeof value === 'object') {
    return [value.title, value.description, value.text, value.content]
      .filter(item => typeof item === 'string' || typeof item === 'number')
      .map(String).join('\\n\\n');
  }
  return '';
};

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    aboutService.get().then(res => setAbout(res?.data || {})).catch(() => setAbout({})).finally(() => setLoading(false));
  }, []);
  const rawContent = about?.content || about || {};
  const content = Object.fromEntries(Object.entries(rawContent).map(([key, value]) => [key, renderableText(value)]));
  const sections = [
    { icon: Leaf, title: 'Our Story', text: content.story || DEFAULT_STORY },
    { icon: Eye, title: 'Our Mission', text: content.mission || DEFAULT_MISSION },
    { icon: Star, title: 'Our Vision', text: content.vision || DEFAULT_VISION },
  ];
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-brand-dark to-brand py-16 sm:py-20 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold uppercase tracking-widest mb-4"><Leaf className="w-4 h-4" /> Our Story</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{renderableText(about?.title) || 'About Sugandhika'}</h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">{content.subtitle || 'Discover the people, purpose and values behind Sugandhika.'}</p>
          <nav className="mt-6 text-sm text-brand-cream/60"><Link to="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><span className="text-white">About Us</span></nav>
        </div>
      </section>
      {loading ? <div className="flex justify-center py-16"><LoadingSpinner /></div> : <>
        {content.imageUrl && <section className="max-w-5xl mx-auto px-4 pt-12"><img src={content.imageUrl} alt="About Sugandhika" className="w-full max-h-[440px] object-cover rounded-2xl shadow-md" /></section>}
        <section className="bg-brand-cream py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12"><h2 className="text-3xl font-bold text-brand-dark">Who We Are</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {sections.map(({ icon: Icon, title, text }) => <div key={title} className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-dark/10 flex items-center justify-center"><Icon className="w-6 h-6 text-brand-dark" /></div>
                <h3 className="text-xl font-bold text-brand-dark">{title}</h3><p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{text}</p>
              </div>)}
            </div>
          </div>
        </section>
        <section className="bg-white py-16 sm:py-20"><div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12"><span className="text-brand text-sm font-semibold uppercase tracking-widest">What Guides Us</span><h2 className="text-4xl font-bold text-brand-dark mt-2">Our Values</h2></div>
          {content.values ? <p className="max-w-3xl mx-auto text-center text-gray-600 leading-relaxed whitespace-pre-line">{content.values}</p> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{VALUES.map(({ icon: Icon, title, desc }) => <div key={title} className="bg-brand-cream rounded-2xl p-7"><div className="w-11 h-11 rounded-xl bg-brand-dark/10 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-brand-dark" /></div><h3 className="font-bold text-brand-dark text-lg mb-2">{title}</h3><p className="text-gray-600 text-sm leading-relaxed">{desc}</p></div>)}</div>}
        </div></section>
        <section className="bg-gradient-to-br from-brand-dark to-brand py-16 sm:py-20 text-white"><div className="max-w-3xl mx-auto px-4 text-center"><div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6"><Star className="w-8 h-8 text-brand-gold" /></div><h2 className="text-3xl sm:text-4xl font-bold mb-5">Our Quality Commitment</h2><p className="text-white/80 leading-relaxed text-lg whitespace-pre-line">{content.qualityCommitment || DEFAULT_QUALITY}</p></div></section>
      </>}
    </div>
  );
}
