import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Shield,
  Heart,
  Star,
  Award,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Users,
  Package,
} from 'lucide-react';
import {
  productsService,
  categoriesService,
  teamService,
  galleryService,
  faqService,
  homepageService,
} from '../services/api.service.js';
import ProductCard from '../components/products/ProductCard.jsx';
import Accordion from '../components/ui/Accordion.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const WHY_FEATURES = [
  {
    icon: Leaf,
    title: '100% Natural',
    desc: 'Made from pure plant extracts and natural ingredients',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    desc: 'Every product tested for purity and effectiveness',
  },
  {
    icon: Heart,
    title: 'Customer Care',
    desc: 'Dedicated support for our valued customers',
  },
  {
    icon: Star,
    title: 'Premium Grade',
    desc: 'Premium quality products at accessible prices',
  },
  {
    icon: Award,
    title: 'Trusted Brand',
    desc: 'Thousands of satisfied customers across Nepal',
  },
  {
    icon: Sparkles,
    title: 'Nature Inspired',
    desc: 'Formulated with traditional botanical wisdom',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [team, setTeam] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    categories: true,
    team: true,
    gallery: true,
    faqs: true,
  });

  useEffect(() => {
    homepageService.getAll().then((res) => setBanners(Array.isArray(res?.data?.banners) ? res.data.banners : [])).catch(() => setBanners([]));

    productsService
      .getFeatured()
      .then((res) => setProducts(Array.isArray(res?.data) ? res.data.slice(0, 6) : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading((p) => ({ ...p, products: false })));

    categoriesService
      .getAll()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading((p) => ({ ...p, categories: false })));

    teamService
      .getFeatured()
      .then((res) => setTeam(Array.isArray(res?.data) ? res.data.slice(0, 3) : []))
      .catch(() => setTeam([]))
      .finally(() => setLoading((p) => ({ ...p, team: false })));

    galleryService
      .getFeatured()
      .then((res) => setGallery(Array.isArray(res?.data) ? res.data.slice(0, 6) : []))
      .catch(() => setGallery([]))
      .finally(() => setLoading((p) => ({ ...p, gallery: false })));

    faqService
      .getFeatured()
      .then((res) => setFaqs(Array.isArray(res?.data) ? res.data.slice(0, 5) : []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading((p) => ({ ...p, faqs: false })));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── 1. HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-brand to-brand-light overflow-hidden">
        {banners[0]?.imageUrl && <img src={banners[0].imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />}
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Leaf className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-medium text-brand-gold">{banners[0]?.subtitle || 'Natural Herbal Products'}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            {banners[0]?.title || 'Pure Nature, Pure Sugandhika'}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            {banners[0]?.description || "Discover premium herbal beauty and wellness products crafted from Nepal's finest botanical extracts and traditional wisdom."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={banners[0]?.buttonUrl || '/products'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-dark font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-xl text-lg"
            >
              {banners[0]?.buttonLabel || 'Explore Products'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={banners[0]?.secondButtonUrl || '/contact'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/40 text-white font-bold rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all text-lg"
            >
              {banners[0]?.secondButtonLabel || 'Contact Us'}
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 20C1200 70 240 -20 0 40L0 80Z" fill="#F5F0E8" />
          </svg>
        </div>
      </section>

      {/* ── 2. BRAND INTRO ───────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-brand text-sm font-semibold uppercase tracking-widest mb-4">
              <Leaf className="w-4 h-4" />
              Our Story
            </div>
            <h2 className="text-4xl font-extrabold text-brand-dark mb-5">
              Welcome to Sugandhika
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              Sugandhika is a Nepal-based brand dedicated to bringing you the finest natural herbal
              beauty and wellness products. We harness the power of pure plant extracts,
              time-honored Ayurvedic traditions, and modern formulation techniques to create
              products that nourish your body and spirit.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every product we craft reflects our deep commitment to quality, sustainability, and
              the rich botanical heritage of Nepal's Himalayas.
            </p>
          </div>

          {/* Decorative right card */}
          <div className="bg-gradient-to-br from-brand-dark to-brand rounded-2xl p-10 text-white shadow-xl flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-5">
              <Leaf className="w-10 h-10 text-brand-gold" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-brand-gold">Nature's Best</h3>
            <p className="text-white/80 leading-relaxed">
              "From Nepal's pristine valleys to your daily routine — pure, natural, and sustainably
              crafted."
            </p>
            <div className="mt-6 w-16 h-1 bg-brand-gold rounded-full" />
            <p className="mt-4 text-white/60 text-sm font-medium">Sugandhika — Pure Botanicals</p>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">
              Handpicked for You
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark mt-2">Featured Products</h2>
          </div>

          {loading.products ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No featured products available.</p>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand transition-colors shadow-md"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORIES ────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">
              Browse by Category
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark mt-2">Shop by Category</h2>
          </div>

          {loading.categories ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md border border-transparent hover:border-brand-light transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-brand-cream flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-light/20 transition-colors">
                    <Leaf className="w-7 h-7 text-brand" />
                  </div>
                  <h3 className="font-bold text-brand-dark group-hover:text-brand transition-colors text-sm">
                    {cat.name}
                  </h3>
                  {cat._count?.products != null && (
                    <p className="text-xs text-gray-500 mt-1">{cat._count.products} products</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No categories available.</p>
          )}
        </div>
      </section>

      {/* ── 5. WHY CHOOSE US ─────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">
              Our Promise
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark mt-2">
              Why Choose Sugandhika?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-brand-cream rounded-2xl p-7 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-dark/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-brand-dark" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark text-lg mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ABOUT PREVIEW ─────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-dark to-brand py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center text-white">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold uppercase tracking-widest mb-4">
              <Leaf className="w-4 h-4" />
              Who We Are
            </div>
            <h2 className="text-4xl font-extrabold mb-5">About Sugandhika</h2>
            <p className="text-white/80 leading-relaxed text-lg mb-6">
              Founded with a passion for natural living, Sugandhika is committed to making
              authentic herbal products accessible to all. Our team of botanical experts and
              traditional healers work together to bring you formulations that are both effective
              and safe.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 grid grid-cols-2 gap-6">
            {[
              { value: '100+', label: 'Products', icon: Package },
              { value: '1000+', label: 'Customers', icon: Users },
              { value: '10+', label: 'Years Experience', icon: Award },
              { value: '100%', label: 'Natural Ingredients', icon: Leaf },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-7 h-7 text-brand-gold mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-brand-gold">{value}</div>
                <div className="text-white/70 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. TEAM PREVIEW ──────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">
              The People Behind
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark mt-2">Meet Our Team</h2>
          </div>

          {loading.team ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-7 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-brand-light/20 border-4 border-brand-cream">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-brand-light" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-brand-dark text-lg">{member.name}</h3>
                  <p className="text-brand text-sm font-medium mt-1">{member.designation}</p>
                  {member.bio && (
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No team members to display.</p>
          )}

          <div className="text-center mt-10">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 px-7 py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand transition-colors shadow-md"
            >
              View All Team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. GALLERY PREVIEW ───────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">
              Visual Journey
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark mt-2">Our Gallery</h2>
          </div>

          {loading.gallery ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`relative overflow-hidden rounded-2xl ${
                    idx === 0 ? 'row-span-2' : ''
                  } aspect-square bg-brand-cream`}
                >
                  <img
                    src={item.url || item.imageUrl}
                    alt={item.title || `Gallery ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No gallery images available.</p>
          )}

          <div className="text-center mt-10">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-7 py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand transition-colors shadow-md"
            >
              View All Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ PREVIEW ───────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">
              Got Questions?
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          {loading.faqs ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : faqs.length > 0 ? (
            <Accordion items={faqs} />
          ) : (
            <p className="text-center text-gray-400 py-12">No FAQs available.</p>
          )}

          <div className="text-center mt-10">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 px-7 py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand transition-colors shadow-md"
            >
              View All FAQs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. WHATSAPP CTA ─────────────────────────────────── */}
      <section className="bg-green-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Order via WhatsApp</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Contact us on WhatsApp for orders, inquiries, or product information. We're just a
            message away!
          </p>
          <a
            href="https://wa.me/9779801234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-700 font-bold text-lg rounded-xl hover:bg-green-50 shadow-xl transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
