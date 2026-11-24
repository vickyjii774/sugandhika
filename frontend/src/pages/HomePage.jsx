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
  Sprout,
  ShieldCheck,
  Mountain,
} from 'lucide-react';
import {
  productsService,
  categoriesService,
  teamService,
  galleryService,
  faqService,
  homepageService,
  featuresService,
  aboutService,
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

const FEATURE_ICON_MAP = { Leaf, Shield, Heart, Star, Award, Sparkles, Sprout, ShieldCheck, Mountain };

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [team, setTeam] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [homeFeatures, setHomeFeatures] = useState(WHY_FEATURES);
  const [aboutContent, setAboutContent] = useState(null);
  const [sectionVisibility, setSectionVisibility] = useState({});
  const isSectionEnabled = (key) => sectionVisibility[key] !== false;
  const [loading, setLoading] = useState({
    products: true,
    categories: true,
    team: true,
    gallery: true,
    faqs: true,
  });

  useEffect(() => {
    homepageService.getAll().then((res) => { const data = res?.data || {}; setBanners(Array.isArray(data.banners) ? data.banners : []); setSectionVisibility(Object.fromEntries((data.sections || []).map(section => [section.sectionKey, section.isEnabled]))); }).catch(() => setBanners([]));
    featuresService.getPublic().then((res) => { if (Array.isArray(res?.data) && res.data.length) setHomeFeatures(res.data.map(item => ({ icon: FEATURE_ICON_MAP[item.icon] || Leaf, title: item.title, desc: item.description, imageUrl: item.imageUrl }))); }).catch(() => {});
    aboutService.get().then((res) => setAboutContent(res?.data?.content || res?.data || {})).catch(() => {});

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
<section className={`relative min-h-[58vh] sm:min-h-[75vh] md:min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-brand to-brand-light overflow-hidden ${isSectionEnabled("hero") ? "" : "hidden"}`}>

  {banners[0]?.imageUrl && (
    <img
      src={banners[0].imageUrl}
      alt=""
      className="absolute inset-0 w-full h-full object-contain sm:object-cover opacity-40"
    />
  )}

  {/* Subtle pattern overlay */}
  <div
    className="absolute inset-0 opacity-10"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
    }}
  />

  <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto py-8 sm:py-16 md:py-20">

    {/* Badge */}
    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
      <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold" />
      <span className="text-[10px] sm:text-sm font-medium text-brand-gold">
        {banners[0]?.subtitle || 'Natural Herbal Products'}
      </span>
    </div>

    {/* Main Heading */}
    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-4 sm:mb-6 drop-shadow-lg">
      {banners[0]?.title || 'Pure Nature, Pure Sugandhika'}
    </h1>

    {/* Description */}
    <p className="text-sm sm:text-lg md:text-2xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed">
      {banners[0]?.description || "Discover premium herbal beauty and wellness products crafted from Nepal's finest botanical extracts and traditional wisdom."}
    </p>

    {/* Buttons */}
    <div className="flex flex-row gap-2 sm:gap-4 justify-center flex-wrap">

      <Link
        to={banners[0]?.buttonUrl || '/products'}
        className="inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-8 py-2.5 sm:py-4 bg-brand-gold text-brand-dark font-bold rounded-lg sm:rounded-xl hover:bg-yellow-400 transition-all shadow-xl text-xs sm:text-lg"
      >
        {banners[0]?.buttonLabel || 'Explore Products'}
        <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5" />
      </Link>

      <Link
        to={banners[0]?.secondButtonUrl || '/contact'}
        className="inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-8 py-2.5 sm:py-4 bg-white/10 border border-white/40 text-white font-bold rounded-lg sm:rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all text-xs sm:text-lg"
      >
        {banners[0]?.secondButtonLabel || 'Contact Us'}
      </Link>

    </div>
  </div>

  {/* Bottom Wave */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <path
        d="M0 80L1440 80L1440 20C1200 70 240 -20 0 40L0 80Z"
        fill="#F5F0E8"
      />
    </svg>
  </div>

</section>


  
{/* ── 2. BRAND INTRO ───────────────────────────────────── */}
<section className={`bg-brand-cream py-8 sm:py-12 md:py-20 ${isSectionEnabled("brand-intro") ? "" : "hidden"}`}>
  <div className="max-w-6xl mx-auto px-3 sm:px-6 grid grid-cols-2 gap-3 sm:gap-8 md:gap-12 items-center">

    {/* Our Story */}
    <div className="min-w-0">
      <div className="inline-flex items-center gap-1 sm:gap-2 text-brand text-[9px] sm:text-sm font-semibold uppercase tracking-widest mb-2 sm:mb-4">
        Our Story
      </div>

     <h2 className="text-[clamp(12px,3.5vw,36px)] whitespace-nowrap font-extrabold text-brand-dark mb-2 sm:mb-5 leading-tight">
  Welcome to Sugandhika
</h2>

      <p className="text-gray-600 leading-relaxed text-[10px] sm:text-base md:text-lg mb-3 sm:mb-6">
        {aboutContent?.story || 'Sugandhika is a Nepal-based brand dedicated to bringing you the finest natural herbal beauty and wellness products.'}
      </p>

      <p className="text-gray-600 leading-relaxed text-[9px] sm:text-sm md:text-base">
        Every product we craft reflects our deep commitment to quality, sustainability, and
        the rich botanical heritage of Nepal's Himalayas.
      </p>
    </div>

    {/* Decorative Right Card */}
    <div className="min-w-0 bg-gradient-to-br from-brand-dark to-brand rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-10 text-white shadow-xl flex flex-col items-center text-center">

      <img
        src="https://tse4.mm.bing.net/th/id/OIP.4WyWqCvqwUjepreWOdNUkwHaFQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
        alt="Mosquito Repellent Stick"
        className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain mb-2 sm:mb-4"
      />

      <h3 className="text-sm sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-brand-gold leading-tight">
        Nature's Best
      </h3>

      <p className="text-white/80 leading-relaxed text-[9px] sm:text-sm md:text-base">
        "From Nepal's pristine valleys to your daily routine — pure, natural, and sustainably
        crafted."
      </p>

      <div className="mt-3 sm:mt-6 w-8 sm:w-16 h-1 bg-brand-gold rounded-full" />

      <p className="mt-2 sm:mt-4 text-white/60 text-[8px] sm:text-xs md:text-sm font-medium">
        Sugandhika — Pure Botanicals
      </p>

    </div>
  </div>
</section>


{/* ── 3. FEATURED PRODUCTS ─────────────────────────────── */}
<section className={`bg-white py-8 sm:py-12 md:py-20 ${isSectionEnabled("featured-products") ? "" : "hidden"}`}>
  <div className="max-w-6xl mx-auto px-2 sm:px-6">

    <div className="text-center mb-5 sm:mb-12">
      <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">
        Featured Products
      </h2>
    </div>

    {loading.products ? (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    ) : products.length > 0 ? (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-400 py-12">
        No featured products available.
      </p>
    )}

    <div className="text-center mt-6 sm:mt-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-7 sm:py-3 bg-brand-dark text-white text-xs sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-brand transition-colors shadow-md"
      >
        View All Products
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </Link>
    </div>

  </div>
</section>


{/* ── 4. CATEGORIES ────────────────────────────────────── */}
<section className={`bg-brand-cream py-8 sm:py-12 md:py-20 ${isSectionEnabled("categories") ? "" : "hidden"}`}>
  <div className="max-w-6xl mx-auto px-2 sm:px-6">

    <div className="text-center mb-5 sm:mb-12">
      <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">
        Shop by Category
      </h2>
    </div>

    {loading.categories ? (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    ) : categories.length > 0 ? (
      <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-5">

        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/products?category=${cat.slug}`}
            className="group bg-white rounded-lg sm:rounded-2xl p-2 sm:p-4 md:p-6 text-center shadow-sm hover:shadow-md border border-transparent hover:border-brand-light transition-all min-w-0"
          >

            <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-brand-cream flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 group-hover:bg-brand-light/20 transition-colors overflow-hidden">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-brand" />
              )}
            </div>

            <h3 className="font-bold text-brand-dark group-hover:text-brand transition-colors text-[9px] sm:text-xs md:text-sm leading-tight break-words">
              {cat.name}
            </h3>

            {cat._count?.products != null && (
              <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-1">
                {cat._count.products} products
              </p>
            )}

          </Link>
        ))}

      </div>
    ) : (
      <p className="text-center text-gray-400 py-12">
        No categories available.
      </p>
    )}

  </div>
</section>



{/* ── 5. WHY CHOOSE US ─────────────────────────────────── */}
<section className={`bg-white py-8 sm:py-12 md:py-20 ${isSectionEnabled("why-choose") ? "" : "hidden"}`}>
  <div className="max-w-6xl mx-auto px-3 sm:px-6">

    <div className="text-center mb-6 sm:mb-12">
      <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">
        Why Choose Sugandhika?
      </h2>
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-6">

      {homeFeatures.map(({ icon: Icon, title, desc, imageUrl }) => (
        <div
          key={title}
          className="bg-brand-cream rounded-lg sm:rounded-2xl p-2.5 sm:p-5 md:p-7 flex flex-col gap-2 sm:gap-3 hover:shadow-md transition-shadow min-w-0"
        >

          {/* Icon + Heading in one line */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">

            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-brand-dark/10 flex items-center justify-center shrink-0 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-dark" />
              )}
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



      {banners[1] && isSectionEnabled('promo-banner') && (
        <section className="bg-brand-dark text-white py-14 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              {banners[1].subtitle && <p className="text-brand-gold text-sm font-semibold uppercase tracking-widest mb-3">{banners[1].subtitle}</p>}
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{banners[1].title}</h2>
              {banners[1].description && <p className="text-white/75 leading-relaxed">{banners[1].description}</p>}
              {banners[1].buttonLabel && <Link to={banners[1].buttonUrl || '/products'} className="inline-flex mt-6 px-6 py-3 rounded-lg bg-brand-gold text-brand-dark font-semibold">{banners[1].buttonLabel}</Link>}
            </div>
            {banners[1].imageUrl && <img src={banners[1].imageUrl} alt={banners[1].title} className="w-full max-h-72 object-cover rounded-2xl" />}
          </div>
        </section>
      )}


{/* ── 6. ABOUT PREVIEW ─────────────────────────────────── */}
<section className={`bg-gradient-to-br from-brand-dark to-brand py-8 sm:py-12 md:py-20 ${isSectionEnabled("about-preview") ? "" : "hidden"}`}>
  <div className="max-w-6xl mx-auto px-3 sm:px-6 grid grid-cols-2 gap-3 sm:gap-8 md:gap-12 items-center text-white">

    {/* About Content */}
    <div className="text-left min-w-0">
      <h2 className="text-lg sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-4 md:mb-5">
        About Sugandhika
      </h2>

      <p className="text-white/80 leading-relaxed text-[10px] sm:text-base md:text-lg mb-3 sm:mb-6">
        Founded with a passion for natural living, Sugandhika is committed to making
        authentic herbal products accessible to all. Our team of botanical experts and
        traditional healers work together to bring you formulations that are both effective
        and safe.
      </p>

      <Link
        to="/about"
        className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-2 sm:px-6 sm:py-3 bg-brand-gold text-brand-dark text-[10px] sm:text-sm font-bold rounded-lg sm:rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
      >
        Learn More
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </Link>
    </div>

    {/* Stats */}
    <div className="min-w-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-2.5 sm:p-6 md:p-8 grid grid-cols-2 gap-x-1 sm:gap-x-4 gap-y-4 sm:gap-y-7">

      {[
        { value: '100+', label: 'Products', icon: Package },
        { value: '1000+', label: 'Customers', icon: Users },
        { value: '10+', label: 'Years Experience', icon: Award },
        { value: '100%', label: 'Natural Ingredients', icon: Leaf },
      ].map(({ value, label, icon: Icon }) => (
        <div key={label} className="text-center min-w-0">
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-brand-gold mx-auto mb-1 sm:mb-2" />

          <div className="text-base sm:text-2xl md:text-3xl font-extrabold text-brand-gold">
            {value}
          </div>

          <div className="text-white/70 text-[8px] sm:text-xs md:text-sm mt-1 leading-tight">
            {label}
          </div>
        </div>
      ))}

    </div>
  </div>
</section>



{/* ── 9. FAQ PREVIEW ───────────────────────────────────── */}
<section className={`bg-brand-cream py-8 sm:py-12 md:py-20 ${isSectionEnabled("faq-preview") ? "" : "hidden"}`}>
  <div className="max-w-3xl mx-auto px-3 sm:px-6">

    <div className="text-center mb-5 sm:mb-12">
      <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">
        Frequently Asked Questions
      </h2>
    </div>

    {loading.faqs ? (
      <div className="flex justify-center py-8 sm:py-12">
        <LoadingSpinner />
      </div>
    ) : faqs.length > 0 ? (
      <div className="text-sm sm:text-base">
        <Accordion items={faqs} />
      </div>
    ) : (
      <p className="text-center text-gray-400 py-8 sm:py-12 text-xs sm:text-base">
        No FAQs available.
      </p>
    )}

    <div className="text-center mt-6 sm:mt-10">
      <Link
        to="/faq"
        className="inline-flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-7 sm:py-3 bg-brand-dark text-white text-xs sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-brand transition-colors shadow-md"
      >
        View All FAQs
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </Link>
    </div>

  </div>
</section>



    </div>
  );
}
