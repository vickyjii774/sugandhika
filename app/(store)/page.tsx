import React from "react";
import Link from "next/link";
import { getHomeData } from "@/lib/actions/store.actions";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";
import {
  Leaf,
  ShieldCheck,
  Award,
  Truck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 60; // ISR 60 sec

export default async function HomePage() {
  const { banners, categories, featuredProducts, testimonials, faqs } = await getHomeData();

  const heroBanner = banners[0] || {
    title: "Pure Eco-Friendly Mosquito Protection",
    subtitle: "100% Chemical-Free Herbal Incense & Organic Fragrances",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&q=80",
    linkUrl: "/shop",
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 min-h-[520px] flex items-center shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner.imageUrl}
            alt={heroBanner.title}
            className="w-full h-full object-cover opacity-40 mix-blend-overlay scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl px-8 sm:px-12 py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-dark/80 text-brand-light text-xs font-bold border border-brand-light/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Organic & Chemical-Free Repellents
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif leading-tight tracking-tight">
            {heroBanner.title}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl font-light leading-relaxed">
            {heroBanner.subtitle}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href={heroBanner.linkUrl || "/shop"}>
              <Button size="lg" variant="primary" className="shadow-hover">
                Explore Eco Store <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/shop?category=mosquito-killer-stick">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
                Mosquito Sticks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center gap-3 p-2">
            <div className="p-3 rounded-xl bg-brand-cream text-brand-dark">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">100% Organic</h4>
              <p className="text-[11px] text-slate-500">Pure plant extracts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-3 rounded-xl bg-brand-cream text-brand-dark">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Kid & Pet Safe</h4>
              <p className="text-[11px] text-slate-500">Zero toxic chemical fumes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-3 rounded-xl bg-brand-cream text-brand-dark">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Free Shipping</h4>
              <p className="text-[11px] text-slate-500">On orders over Rs. 1,500</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-3 rounded-xl bg-brand-cream text-brand-dark">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Fonepay Verified</h4>
              <p className="text-[11px] text-slate-500">Instant QR & COD payments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Shop By Product Category
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1"
          >
            View All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-48 rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 border border-slate-100 flex flex-col justify-end p-4"
            >
              <img
                src={cat.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
              <div className="relative z-10">
                <h3 className="text-base font-bold text-white group-hover:text-brand-light transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
              Popular Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Featured Eco Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1"
          >
            Explore Catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Story / Eco Value Callout */}
      <section className="bg-brand-cream/60 py-16 border-y border-brand-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
              The Sugandhika Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif leading-tight">
              Why Say Goodbye to Chemical Mosquito Coil Smoke?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Traditional chemical coils and synthetic liquid vaporizers release transfluthrin and formaldehyde gases that irritate airways, provoke allergies, and pose health risks to children and elderly family members.
            </p>
            <div className="space-y-3 pt-2">
              {[
                "Crafted using 100% natural Citronella, Neem, Lemongrass, and Cedarwood.",
                "Emits gentle therapeutic fragrance without harsh smoke.",
                "Proven effective indoor & outdoor protection against dengue and malaria mosquitoes.",
                "Handrolled in small batches using sustainable Himalayan ingredients.",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-dark shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="/shop?category=mosquito-killer-stick">
                <Button variant="primary">Switch to Herbal Mosquito Protection</Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80"
                alt="Organic Ingredients"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs hidden sm:block">
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={5} size="sm" />
                <span className="text-xs font-bold text-slate-800">5.0 Star Rated</span>
              </div>
              <p className="text-xs text-slate-600 italic">
                "Sugandhika mosquito sticks smell divine and eliminated all mosquitoes in our living room!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
            Customer Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Loved By Thousands of Families
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <RatingStars rating={t.rating} size="sm" />
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-brand-light/20 text-brand-dark flex items-center justify-center font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-soft transition-all"
            >
              <summary className="font-bold text-sm text-slate-800 cursor-pointer flex items-center justify-between list-none">
                <span>{faq.question}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
