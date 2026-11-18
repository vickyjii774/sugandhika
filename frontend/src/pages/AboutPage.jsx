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
const DEFAULT_QUALITY = "At Sugandhika, quality is non-negotiable. Every batch of our products undergoes rigorous testing to ensure purity, potency, and safety. We source our ingredients only from trusted, sustainable suppliers - often local farmers who share our values. From formulation to packaging, our standards are uncompromising.";

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aboutService.get()
      .then(res => setAbout(res.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sections = [
    { icon: Leaf, title: 'Our Story', text: about?.story || DEFAULT_STORY },
    { icon: Eye, title: 'Our Mission', text: about?.mission || DEFAULT_MISSION },
    { icon: Star, title: 'Our Vision', text: about?.vision || DEFAULT_VISION },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-dark to-brand py-20 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold uppercase tracking-widest mb-4">
            <Leaf className="w-4 h-4" /> Our Story
          </div>
          <h1 className="text-5xl font-bold mb-4">About Sugandhika</h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
            Nepal's premier natural herbal brand, blending botanical heritage with modern wellness.
          </p>
          <nav className="mt-6 text-sm text-brand-cream/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">About Us</span>
          </nav>
        </div>
      </section>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner /></div>}

      {!loading && (
        <>
          {/* Story / Mission / Vision */}
          <section className="bg-brand-cream py-20">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-brand-dark">Who We Are</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {sections.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="bg-white rounded-2xl p-7 shadow-sm flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-dark/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-brand-dark" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="bg-white py-20">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-12">
                <span className="text-brand text-sm font-semibold uppercase tracking-widest">What Guides Us</span>
                <h2 className="text-4xl font-bold text-brand-dark mt-2">Our Values</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {VALUES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-brand-cream rounded-2xl p-7 hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-xl bg-brand-dark/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-dark" />
                    </div>
                    <h3 className="font-bold text-brand-dark text-lg mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quality Commitment */}
          <section className="bg-gradient-to-br from-brand-dark to-brand py-20 text-white">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-brand-gold" />
              </div>
              <h2 className="text-4xl font-bold mb-5">Our Quality Commitment</h2>
              <p className="text-white/80 leading-relaxed text-lg">
                {about?.qualityCommitment || DEFAULT_QUALITY}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
