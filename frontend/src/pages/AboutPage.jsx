
import { useState, useEffect } from 'react';
import {
  Leaf,
  Eye,
  Heart,
  Recycle,
  Lightbulb,
  Users,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { aboutService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useSettings } from '../hooks/useSettings.js';
import { ArrowRight } from 'lucide-react';
import { navigationService } from '../services/api.service.js';
import { useLocation } from 'react-router-dom';
import { teamService } from '../services/api.service.js';



const VALUES = [
  {
    icon: Star,
    title: 'Quality',
    desc: 'We never compromise on the quality of our ingredients or our processes.'
  },
  {
    icon: Leaf,
    title: 'Integrity',
    desc: 'Transparency and honesty guide every decision we make.'
  },
  {
    icon: Recycle,
    title: 'Sustainability',
    desc: 'We care deeply about the planet and choose eco-friendly practices.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    desc: 'Blending ancient wisdom with modern science for superior results.'
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'Supporting local farmers and artisans who harvest our botanicals.'
  },
  {
    icon: Heart,
    title: 'Excellence',
    desc: 'Striving for the best in everything - from sourcing to packaging.'
  }
];

const DEFAULT_STORY =
  "Sugandhika was born from a deep love for Nepal's botanical treasures. We set out to create a brand that celebrates pure, natural ingredients while supporting local communities and sustainable agriculture.";

const DEFAULT_MISSION =
  'To deliver premium-quality natural herbal products that enhance well-being, inspire confidence, and connect people with the healing power of nature.';

const DEFAULT_VISION =
  "To become Nepal's most trusted natural wellness brand, recognized globally for our commitment to quality, purity, and sustainable botanical practices.";

const DEFAULT_QUALITY =
  "At Sugandhika, quality is non-negotiable. Every batch of our products undergoes rigorous testing to ensure purity, potency, and safety.";

// Safely handle strings, arrays and rich text objects from admin content.
const renderableText = (value) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => renderableText(item))
      .filter(Boolean)
      .join('\n\n');
  }

  if (value && typeof value === 'object') {
    return [
      value.title,
      value.description,
      value.text,
      value.content
    ]
      .filter(
        (item) =>
          typeof item === 'string' ||
          typeof item === 'number'
      )
      .map(String)
      .join('\n\n');
  }

  return '';
};

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aboutService
      .get()
      .then((res) => setAbout(res?.data || {}))
      .catch(() => setAbout({}))
      .finally(() => setLoading(false));
  }, []);

  const rawContent = about?.content || about || {};

  const content = Object.fromEntries(
    Object.entries(rawContent).map(([key, value]) => [
      key,
      renderableText(value)
    ])
  );

  const sections = [
    {
      icon: Leaf,
      title: 'Our Story',
      text: content.story || DEFAULT_STORY
    },
    {
      icon: Eye,
      title: 'Our Mission',
      text: content.mission || DEFAULT_MISSION
    },
    {
      icon: Star,
      title: 'Our Vision',
      text: content.vision || DEFAULT_VISION
    }
  ];

  return (
    <div className="min-h-screen">

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-dark to-brand py-10 sm:py-16 md:py-20 text-white text-center px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            {renderableText(about?.title) || 'About Sugandhika'}
          </h1>

          <p className="text-white/70 text-xs sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {content.subtitle ||
              'Discover the people, purpose and values behind Sugandhika.'}
          </p>

        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <>

          {/* ── 2. ABOUT IMAGE ─────────────────────────── */}
          {content.imageUrl && (
            <section className="max-w-5xl mx-auto px-3 sm:px-6 pt-8 sm:pt-12">
              <img
                src={content.imageUrl}
                alt="About Sugandhika"
                className="w-full max-h-[440px] object-cover rounded-xl sm:rounded-2xl shadow-md"
              />
            </section>
          )}

          {/* ── 3. WHO WE ARE ──────────────────────────── */}
          <section className="bg-brand-cream py-8 sm:py-12 md:py-20">
            <div className="max-w-5xl mx-auto px-2 sm:px-6">

              <div className="text-center mb-6 sm:mb-12">
                <h2 className="text-xl sm:text-3xl font-bold text-brand-dark">
                  Who We Are
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-5 md:gap-8">

                {sections.map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="bg-white rounded-lg sm:rounded-2xl p-2.5 sm:p-5 md:p-7 shadow-sm flex flex-col gap-2 sm:gap-4 min-w-0"
                  >

                    {/* Icon + Title */}
                    <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">

                      <div className="w-6 h-6 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-brand-dark/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-dark" />
                      </div>

                      <h3 className="text-[9px] sm:text-base md:text-lg font-bold text-brand-dark leading-tight">
                        {title}
                      </h3>

                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-[8px] sm:text-xs md:text-sm whitespace-pre-line">
                      {text}
                    </p>

                  </div>
                ))}

              </div>
            </div>
          </section>

          {/* ── 4. OUR VALUES ──────────────────────────── */}
          <section className="bg-white py-8 sm:py-12 md:py-20">
            <div className="max-w-5xl mx-auto px-2 sm:px-6">

              <div className="text-center mb-6 sm:mb-12">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-brand-dark">
                  Our Values
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-5">

                {VALUES.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="bg-brand-cream rounded-lg sm:rounded-2xl p-2.5 sm:p-5 md:p-7 min-w-0"
                  >

                    {/* Icon + Title in one line */}
                    <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4 min-w-0">

                      <div className="w-6 h-6 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-brand-dark/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-dark" />
                      </div>

                      <h3 className="font-bold text-brand-dark text-[9px] sm:text-base md:text-lg leading-tight min-w-0">
                        {title}
                      </h3>

                    </div>

                    {/* Description below */}
                    <p className="text-gray-600 text-[8px] sm:text-xs md:text-sm leading-relaxed">
                      {desc}
                    </p>

                  </div>
                ))}

              </div>
            </div>
          </section>

          {/* ── 5. QUALITY COMMITMENT ──────────────────── */}
          <section className="bg-brand-cream from-brand-dark to-brand py-10 sm:py-16 md:py-20 text-brand-dark">
            <div className="max-w-3xl mx-auto px-3 sm:px-6 text-center">

              

              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-5">
                Our Quality Commitment
              </h2>

              <p className="text-brand-dark leading-relaxed text-xs sm:text-base md:text-lg whitespace-pre-line">
                {content.qualityCommitment || DEFAULT_QUALITY}
              </p>

            </div>
          </section>

          
         
          {/* ── 6. TEAM SECTION ─────────────────────────── */}
          <section className="bg-brand-white py-8 sm:py-12 md:py-20">
            <div className="max-w-3xl mx-auto px-3 sm:px-6 text-center">

              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark">
                Meet Our Team
              </h2>

              <p className="text-gray-600 text-xs sm:text-base mt-3">
                Get to know the passionate people behind Sugandhika.
              </p>

              <div className="mt-5 sm:mt-8">
                <Link
                  to="/team"
                  className="inline-flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-7 sm:py-3 bg-brand-dark text-white text-xs sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-brand transition-colors shadow-md"
                >
                  View All Team Members
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>

            </div>
          </section>

          {/* ── 7. GALLERY SECTION ──────────────────────── */}
          <section className="bg-brand-cream py-8 sm:py-12 md:py-20">
            <div className="max-w-3xl mx-auto px-3 sm:px-6 text-center">

              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark">
                Explore Our Gallery
              </h2>

              <p className="text-gray-600 text-xs sm:text-base mt-3">
                Discover our products, events and memorable moments.
              </p>

              <div className="mt-5 sm:mt-8">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-7 sm:py-3 bg-brand-dark text-white text-xs sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-brand transition-colors shadow-md"
                >
                  View All Gallery
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>

            </div>
          </section>



        </>
      )}

    </div>
  );
}
