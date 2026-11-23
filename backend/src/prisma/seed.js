import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Sugandhika database...');

  // ── Super Admin ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sugandhika.com' },
    update: {},
    create: { name: 'Sugandhika Admin', email: 'admin@sugandhika.com', password: hashedPassword, role: 'SUPER_ADMIN' },
  });
  console.log('✅ Admin user:', admin.email);

  // ── Site Settings ─────────────────────────────────────────────────────────
  await prisma.siteSetting.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main', siteName: 'Sugandhika', tagline: 'Pure Eco Fragrance',
      description: 'Sugandhika brings together Nepal\'s natural heritage and modern living through thoughtfully crafted herbal fragrances and botanical wellness products.',
      phone: '+977-1-4XXXXXX', whatsapp: '9779801234567',
      email: 'info@sugandhika.com', address: 'Lazimpat, Kathmandu, Nepal',
      facebookUrl: 'https://facebook.com/sugandhika', instagramUrl: 'https://instagram.com/sugandhika',
      footerText: 'Bringing Nepal\'s natural heritage to your home.', copyright: '© 2026 Sugandhika. All rights reserved.',
    },
  });
  console.log('✅ Site settings');

  // ── Contact Information ───────────────────────────────────────────────────
  await prisma.contactInformation.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main', phone: '+977-1-4XXXXXX', whatsapp: '9779801234567',
      email: 'info@sugandhika.com', address: 'Lazimpat, Kathmandu, Nepal',
      businessHours: 'Sunday – Friday: 9:00 AM – 6:00 PM',
    },
  });
  console.log('✅ Contact information');

  // ── Navigation ────────────────────────────────────────────────────────────
  const navItems = [
    { label: 'Home', url: '/', sortOrder: 0 },
    { label: 'About Us', url: '/about', sortOrder: 1 },
    { label: 'Products', url: '/products', sortOrder: 2 },
    { label: 'Our Team', url: '/team', sortOrder: 3 },
    { label: 'Gallery', url: '/gallery', sortOrder: 4 },
    { label: 'FAQ', url: '/faq', sortOrder: 5 },
    { label: 'Contact Us', url: '/contact', sortOrder: 6 },
  ];
  for (const item of navItems) {
    await prisma.navigationItem.upsert({ where: { id: item.label.toLowerCase().replace(/\s/g, '-') + '-nav' }, update: {}, create: { id: item.label.toLowerCase().replace(/\s/g, '-') + '-nav', ...item } });
  }
  console.log('✅ Navigation items');

  // ── Homepage Sections ─────────────────────────────────────────────────────
  const sections = [
    { sectionKey: 'hero', title: 'Hero Banner', sortOrder: 0, isEnabled: true },
    { sectionKey: 'brand-intro', title: 'Brand Introduction', sortOrder: 1, isEnabled: true },
    { sectionKey: 'featured-products', title: 'Featured Products', sortOrder: 2, isEnabled: true },
    { sectionKey: 'categories', title: 'Product Categories', sortOrder: 3, isEnabled: true },
    { sectionKey: 'why-choose', title: 'Why Choose Sugandhika', sortOrder: 4, isEnabled: true },
    { sectionKey: 'promo-banner', title: 'Promotional Banner', sortOrder: 5, isEnabled: true },
    { sectionKey: 'about-preview', title: 'About Preview', sortOrder: 6, isEnabled: true },
    { sectionKey: 'team-preview', title: 'Team Preview', sortOrder: 7, isEnabled: true },
    { sectionKey: 'gallery-preview', title: 'Gallery Preview', sortOrder: 8, isEnabled: true },
    { sectionKey: 'faq-preview', title: 'FAQ Preview', sortOrder: 9, isEnabled: true },
    { sectionKey: 'whatsapp-cta', title: 'WhatsApp CTA', sortOrder: 10, isEnabled: true },
  ];
  for (const s of sections) {
    await prisma.homepageSection.upsert({ where: { sectionKey: s.sectionKey }, update: {}, create: s });
  }
  console.log('✅ Homepage sections');

  // ── Banners ───────────────────────────────────────────────────────────────
  await prisma.banner.upsert({
    where: { id: 'hero-banner-1' },
    update: {},
    create: {
      id: 'hero-banner-1',
      title: 'Pure Eco-Friendly Fragrance', subtitle: 'Nature\'s Best, For Your Home',
      description: '100% natural herbal fragrances crafted from Himalayan botanicals. Chemical-free, safe for your family.',
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&q=80',
      buttonLabel: 'Shop Now', buttonUrl: '/products',
      secondButtonLabel: 'Contact Us', secondButtonUrl: '/contact',
      isActive: true, sortOrder: 0,
    },
  });
  console.log('✅ Banners');

  // ── Why Choose Us Features ────────────────────────────────────────────────
  const features = [
    { title: '100% Organic', description: 'Pure plant extracts and botanical ingredients. No synthetic chemicals, no artificial fragrances.', icon: 'Leaf', sortOrder: 0 },
    { title: 'Pure Plant Extracts', description: 'Sourced from the finest Himalayan herbs and botanicals, carefully selected for purity.', icon: 'Sprout', sortOrder: 1 },
    { title: 'Quality Assured', description: 'Every product undergoes rigorous quality checks to ensure consistent excellence.', icon: 'ShieldCheck', sortOrder: 2 },
    { title: 'Nature Inspired', description: 'Inspired by Nepal\'s rich botanical heritage and traditional wellness practices.', icon: 'Mountain', sortOrder: 3 },
    { title: 'Customer Satisfaction', description: 'Your satisfaction is our priority. We stand behind every product we make.', icon: 'Heart', sortOrder: 4 },
    { title: 'Trusted Products', description: 'Trusted by families across Nepal for safe, effective, and natural home fragrance.', icon: 'Award', sortOrder: 5 },
  ];
  for (const f of features) {
    await prisma.feature.upsert({ where: { id: `feature-${f.sortOrder}` }, update: {}, create: { id: `feature-${f.sortOrder}`, ...f } });
  }
  console.log('✅ Features (Why Choose Us)');

  // ── Categories ────────────────────────────────────────────────────────────
  const categories = [
    { id: 'cat-1', name: 'Mosquito Killer Sticks', slug: 'mosquito-killer-sticks', description: '100% natural, eco-friendly mosquito repellent sticks crafted from herbal extracts and essential oils. Safe for children and pets.', imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', sortOrder: 0 },
    { id: 'cat-2', name: 'Mosquito Powder', slug: 'mosquito-powder', description: 'Organic smoke-less mosquito repellent powder for indoor and outdoor pest control.', imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&q=80', sortOrder: 1 },
    { id: 'cat-3', name: 'Mosquito Liquid', slug: 'mosquito-liquid', description: 'Herbal essential-oil based vaporizing liquid compatible with standard electric diffusers.', imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80', sortOrder: 2 },
    { id: 'cat-4', name: 'Natural Air Freshener', slug: 'natural-air-freshener', description: 'Refreshing room sprays distilled from natural botanical flowers, lemongrass, and citrus oils.', imageUrl: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600&q=80', sortOrder: 3 },
    { id: 'cat-5', name: 'Herbal Incense', slug: 'herbal-incense', description: 'Traditional handmade dhoop and dhoop sticks for spiritual serenity, yoga, and meditation.', imageUrl: 'https://images.unsplash.com/photo-1512290900673-70020041199d?w=600&q=80', sortOrder: 4 },
    { id: 'cat-6', name: 'Gift Packs', slug: 'gift-packs', description: 'Elegantly packaged eco-friendly fragrance gift boxes perfect for festivals and special occasions.', imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80', sortOrder: 5 },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({ where: { id: cat.id }, update: {}, create: { ...cat, isPublished: true } });
  }
  console.log('✅ Categories');

  // ── Products ──────────────────────────────────────────────────────────────
  const products = [
    {
      id: 'prod-1', name: 'Herbal Mosquito Killer Stick (Pack of 10)', slug: 'herbal-mosquito-killer-stick-10',
      sku: 'SMS-001', categoryId: 'cat-1',
      shortDescription: 'Natural mosquito repellent sticks with citronella and neem extracts. Burns clean, smells pleasant.',
      description: 'Our flagship Herbal Mosquito Killer Stick is made from a proprietary blend of citronella, neem, eucalyptus, and lemongrass. Each stick burns for 45–60 minutes providing effective mosquito protection for a room up to 200 sq ft.\n\nHandcrafted in Nepal using traditional methods combined with modern quality standards.',
      ingredients: 'Citronella oil, Neem extract, Eucalyptus oil, Lemongrass, Natural binding agents (sawdust, charcoal), Bamboo stick',
      benefits: '• Effective mosquito repellent\n• Pleasant natural fragrance\n• Safe for children and pets\n• No toxic chemicals\n• Long-lasting protection\n• Environmentally friendly',
      directions: 'Light the tip of the stick and allow flame to establish for 5 seconds, then blow out. Place in a holder on a stable surface away from flammable materials. Keep out of reach of children.',
      price: 299, discountPrice: 249, stockQty: 100, isFeatured: true, isPublished: true,
      mainImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    },
    {
      id: 'prod-2', name: 'Lavender Room Freshener Spray (200ml)', slug: 'lavender-room-freshener-spray',
      sku: 'AFS-001', categoryId: 'cat-4',
      shortDescription: 'Natural lavender room spray made from pure essential oils. Long-lasting freshness.',
      description: 'Transform your space with the calming scent of pure lavender. Our Natural Air Freshener Spray uses only real essential oils — no synthetic fragrances, no harsh chemicals. Safe for the whole family, including children and pets.',
      ingredients: 'Purified water, Lavender essential oil (Lavandula angustifolia), Alcohol (natural, plant-derived), Glycerin',
      benefits: '• Pure essential oil fragrance\n• Calming and relaxing\n• Safe for children and pets\n• No synthetic fragrances\n• Long-lasting freshness\n• Light and non-sticky',
      directions: 'Shake well before use. Hold 30cm from surface and spray 2-3 times into the air. Avoid eyes and direct inhalation. For external use only.',
      price: 450, discountPrice: 399, stockQty: 80, isFeatured: true, isPublished: true,
      mainImage: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80',
    },
    {
      id: 'prod-3', name: 'Premium Dhoop Sticks — Himalayan Herbs (20 sticks)', slug: 'premium-dhoop-sticks-himalayan',
      sku: 'INC-001', categoryId: 'cat-5',
      shortDescription: 'Traditional handmade dhoop sticks with Himalayan herbs. Perfect for meditation and prayer.',
      description: 'Crafted using ancient Himalayan recipes, our Premium Dhoop Sticks combine over 15 sacred herbs and resins. Each stick is hand-rolled by skilled artisans and air-dried naturally to preserve the purity of the ingredients.',
      ingredients: 'Guggul resin, Sandalwood powder, Himalayan herbs blend, Jatamansi, Nag champa, Natural charcoal, Binding gum',
      benefits: '• Pure Himalayan ingredients\n• Perfect for meditation and yoga\n• Creates a sacred atmosphere\n• Long burning time (40 min)\n• No synthetic fragrances\n• Handcrafted by artisans',
      directions: 'Light the tip and let it catch fire for 10 seconds, then blow out gently. Place upright in a dhoop holder. Use in a well-ventilated area.',
      price: 350, discountPrice: null, stockQty: 60, isFeatured: true, isPublished: true,
      mainImage: 'https://images.unsplash.com/photo-1512290900673-70020041199d?w=800&q=80',
    },
    {
      id: 'prod-4', name: 'Citronella Mosquito Repellent Powder (500g)', slug: 'citronella-mosquito-powder',
      sku: 'MP-001', categoryId: 'cat-2',
      shortDescription: 'Powerful organic mosquito repellent powder for indoor and outdoor use.',
      description: 'Our Citronella Mosquito Repellent Powder is a powerful, smoke-less solution for mosquito control. Perfect for use around homes, gardens, and outdoor spaces. The fine powder disperses easily and provides long-lasting protection.',
      ingredients: 'Citronella grass powder, Neem leaf powder, Eucalyptus leaf powder, Clove powder, Diatomaceous earth',
      benefits: '• Smoke-less formula\n• Suitable for indoor and outdoor\n• Long-lasting effectiveness\n• Safe for the environment\n• Easy to apply\n• Cost-effective coverage',
      directions: 'Sprinkle lightly around doorways, windows, and areas where mosquitoes gather. Reapply every 24-48 hours or after rain.',
      price: 399, discountPrice: 349, stockQty: 50, isFeatured: false, isPublished: true,
      mainImage: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80',
    },
    {
      id: 'prod-5', name: 'Festival Gift Box — Premium Collection', slug: 'festival-gift-box-premium',
      sku: 'GIFT-001', categoryId: 'cat-6',
      shortDescription: 'Beautifully packaged collection of Sugandhika\'s best products. Perfect for Dashain, Tihar, and special occasions.',
      description: 'Give the gift of natural living with our Premium Festival Gift Box. This beautifully packaged collection includes our best-selling mosquito sticks, room freshener, and dhoop sticks, presented in an elegant eco-friendly box.',
      ingredients: 'Contains: Herbal Mosquito Sticks (1 pack), Lavender Room Freshener (1 bottle), Premium Dhoop Sticks (1 pack)',
      benefits: '• Beautifully gift-wrapped\n• Multiple product variety\n• Eco-friendly packaging\n• Perfect for all occasions\n• Great value bundle\n• Personalized message card available',
      directions: 'Each item in the gift box comes with its own usage instructions.',
      price: 1250, discountPrice: 999, stockQty: 30, isFeatured: true, isPublished: true,
      mainImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
    },
    {
      id: 'prod-6', name: 'Herbal Mosquito Repellent Liquid (45ml)', slug: 'herbal-mosquito-liquid',
      sku: 'ML-001', categoryId: 'cat-3',
      shortDescription: 'Herbal vaporizer liquid compatible with all standard electric mosquito machines.',
      description: 'Our Herbal Mosquito Repellent Liquid uses a natural blend of citronella and neem essential oils in a water-based formula. Compatible with all standard electric vaporizer machines. Provides 8-10 hours of continuous protection per refill.',
      ingredients: 'Purified water, Citronella essential oil, Neem oil, Lemongrass extract, Emulsifier (plant-derived)',
      benefits: '• Compatible with all vaporizers\n• 8-10 hours protection\n• Pleasant natural scent\n• No harmful chemicals\n• Water-based formula\n• Safe around children and pets',
      directions: 'Insert into compatible electric vaporizer machine. Replace when liquid runs out. Use in closed room for best results.',
      price: 199, discountPrice: 179, stockQty: 120, isFeatured: false, isPublished: true,
      mainImage: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80',
    },
  ];
  for (const prod of products) {
    await prisma.product.upsert({ where: { id: prod.id }, update: {}, create: { ...prod, availability: 'IN_STOCK', seoTitle: prod.name + ' | Sugandhika' } });
  }
  console.log('✅ Products');

  // ── About Page ────────────────────────────────────────────────────────────
  await prisma.page.upsert({
    where: { pageKey: 'about' },
    update: {},
    create: {
      pageKey: 'about', title: 'About Sugandhika', isPublished: true,
      content: {
        story: 'Sugandhika was born from a simple yet profound belief — that nature holds the finest solutions for a healthier, more harmonious life. Founded in Kathmandu, Nepal, we set out to bring the healing power of Himalayan botanicals into everyday living.\n\nOur journey began when our founders, inspired by generations of traditional Ayurvedic wisdom and Nepal\'s rich botanical heritage, decided to create products that honour both human wellbeing and the natural world.',
        mission: 'To provide natural, eco-friendly fragrance and wellness products that enhance daily life while preserving Nepal\'s botanical heritage and protecting our environment.',
        vision: 'To be Nepal\'s most trusted name in natural home fragrance, bringing Himalayan purity to every home across the country and beyond.',
        values: [
          { title: 'Purity', description: 'We use only the finest natural ingredients, free from synthetic chemicals.' },
          { title: 'Sustainability', description: 'Our products and processes honour the environment we depend on.' },
          { title: 'Authenticity', description: 'Rooted in Nepal\'s traditional botanical knowledge and craftsmanship.' },
          { title: 'Quality', description: 'Every product meets our rigorous standards before it reaches your home.' },
          { title: 'Community', description: 'We support local artisans and sustainable sourcing practices.' },
        ],
        qualityCommitment: 'At Sugandhika, quality is not a department — it is our entire culture. From raw material sourcing to final packaging, every step is carefully monitored to ensure consistency, safety, and effectiveness.',
        images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'],
      },
      seoTitle: 'About Sugandhika | Our Story, Mission & Values',
      seoDescription: 'Learn about Sugandhika, Nepal\'s natural home fragrance brand. Discover our story, mission, and commitment to pure botanical products.',
    },
  });
  console.log('✅ About page');

  // ── Team Members ──────────────────────────────────────────────────────────
  const teamMembers = [
    { id: 'team-1', name: 'Rajesh Sharma', designation: 'Founder & CEO', department: 'Leadership', bio: 'Rajesh founded Sugandhika with a vision to bring Nepal\'s natural botanical wealth to everyday homes. With over 15 years in the wellness industry, he leads with passion and purpose.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', sortOrder: 0, isPublished: true, isFeatured: true },
    { id: 'team-2', name: 'Priya Thapa', designation: 'Head of Product Development', department: 'Product', bio: 'Priya leads our product innovation team, drawing on her expertise in Ayurvedic formulations and modern botanical science to create products that work and delight.', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', sortOrder: 1, isPublished: true, isFeatured: true },
    { id: 'team-3', name: 'Anish Karmacharya', designation: 'Operations Manager', department: 'Operations', bio: 'Anish ensures that Sugandhika\'s operations run smoothly, from supply chain management to delivery logistics, maintaining our commitment to quality at every step.', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', sortOrder: 2, isPublished: true, isFeatured: true },
  ];
  for (const member of teamMembers) {
    await prisma.teamMember.upsert({ where: { id: member.id }, update: {}, create: member });
  }
  console.log('✅ Team members');

  // ── Gallery Albums ────────────────────────────────────────────────────────
  await prisma.galleryAlbum.upsert({
    where: { id: 'album-1' },
    update: {},
    create: { id: 'album-1', title: 'Products', slug: 'products', description: 'Our complete range of natural fragrance and wellness products.', coverImageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', sortOrder: 0, isPublished: true },
  });
  await prisma.galleryAlbum.upsert({
    where: { id: 'album-2' },
    update: {},
    create: { id: 'album-2', title: 'Company Events', slug: 'company-events', description: 'Highlights from our company events, launches, and community activities.', coverImageUrl: 'https://images.unsplash.com/photo-1512290900673-70020041199d?w=600&q=80', sortOrder: 1, isPublished: true },
  });
  console.log('✅ Gallery albums');

  // ── FAQ Categories & FAQs ─────────────────────────────────────────────────
  const faqCat1 = await prisma.fAQCategory.upsert({
    where: { id: 'faqcat-1' },
    update: {},
    create: { id: 'faqcat-1', name: 'Products & Ordering', sortOrder: 0, isPublished: true },
  });
  const faqCat2 = await prisma.fAQCategory.upsert({
    where: { id: 'faqcat-2' },
    update: {},
    create: { id: 'faqcat-2', name: 'Delivery & Payment', sortOrder: 1, isPublished: true },
  });

  const faqs = [
    { id: 'faq-1', question: 'What products does Sugandhika offer?', answer: 'Sugandhika offers a range of natural home fragrance and mosquito protection products including herbal mosquito killer sticks, mosquito powder, mosquito repellent liquid, natural air fresheners, herbal incense (dhoop), and gift packs. All our products are made from natural, chemical-free ingredients.', categoryId: faqCat1.id, sortOrder: 0, isPublished: true, isFeatured: true },
    { id: 'faq-2', question: 'Are Sugandhika products safe for children and pets?', answer: 'Yes, our products are formulated with natural ingredients that are safe for use around children and pets when used as directed. We do not use harmful synthetic chemicals, pesticides, or artificial fragrances. However, we recommend keeping burning products (sticks, dhoop) away from young children and ensuring good ventilation.', categoryId: faqCat1.id, sortOrder: 1, isPublished: true, isFeatured: true },
    { id: 'faq-3', question: 'How can I place an order?', answer: 'You can easily place an order through our website by clicking the WhatsApp Order button on any product page. This opens a WhatsApp conversation with your order details pre-filled. Alternatively, you can contact us directly on WhatsApp at +977-980-1234567 or visit our store at Lazimpat, Kathmandu.', categoryId: faqCat1.id, sortOrder: 2, isPublished: true, isFeatured: true },
    { id: 'faq-4', question: 'Are your products available throughout Nepal?', answer: 'Yes! We deliver across Nepal. We have established delivery partnerships with trusted courier services that reach most districts. For remote locations, delivery times may vary. Contact us on WhatsApp to confirm delivery availability in your area.', categoryId: faqCat2.id, sortOrder: 0, isPublished: true, isFeatured: false },
    { id: 'faq-5', question: 'What payment methods are available?', answer: 'We accept payment through eSewa, Khalti, FonePay QR, and Cash on Delivery (COD). For online orders placed via WhatsApp, payment details will be shared once your order is confirmed.', categoryId: faqCat2.id, sortOrder: 1, isPublished: true, isFeatured: false },
    { id: 'faq-6', question: 'How long does delivery take?', answer: 'For Kathmandu Valley deliveries, we typically deliver within 1-2 business days. For other cities and districts, delivery takes 3-7 business days depending on the location. Express delivery options may be available — contact us for details.', categoryId: faqCat2.id, sortOrder: 2, isPublished: true, isFeatured: true },
    { id: 'faq-7', question: 'How should I use the mosquito killer sticks?', answer: 'Light the tip of the stick and allow the flame to establish for 5 seconds, then gently blow it out. Place the stick in a suitable holder on a stable, non-flammable surface. One stick is effective for a room up to 200 sq ft. Keep out of reach of children and ensure there is some ventilation in the room.', categoryId: faqCat1.id, sortOrder: 3, isPublished: true, isFeatured: false },
    { id: 'faq-8', question: 'What is your return policy?', answer: 'We stand behind our products. If you are not satisfied with your purchase, please contact us within 7 days of receiving your order. We will arrange a replacement or refund depending on the issue. Products must be unused and in original packaging for returns.', categoryId: faqCat2.id, sortOrder: 3, isPublished: true, isFeatured: false },
  ];
  for (const faq of faqs) {
    await prisma.fAQ.upsert({ where: { id: faq.id }, update: {}, create: faq });
  }
  console.log('✅ FAQs');

  // ── SEO Defaults ──────────────────────────────────────────────────────────
  const seoPages = [
    { pageKey: 'home', title: 'Sugandhika | Pure Eco-Friendly Fragrance & Natural Products', description: 'Shop 100% natural herbal mosquito killer sticks, organic incense, and Himalayan room fresheners. Safe for kids & pets. Available across Nepal.', keywords: 'sugandhika, herbal mosquito repellent, natural fragrance, eco-friendly, nepal' },
    { pageKey: 'about', title: 'About Sugandhika | Our Story & Mission', description: 'Learn about Sugandhika\'s journey, mission, and commitment to natural botanical wellness products from the heart of Nepal.', keywords: 'about sugandhika, natural products nepal, himalayan botanicals' },
    { pageKey: 'products', title: 'Products | Sugandhika Natural Fragrance', description: 'Browse our complete range of natural mosquito repellents, room fresheners, herbal incense, and gift packs.', keywords: 'sugandhika products, herbal mosquito sticks, natural air freshener nepal' },
    { pageKey: 'contact', title: 'Contact Sugandhika | Get in Touch', description: 'Contact Sugandhika for orders, inquiries, or support. WhatsApp, email, or visit us in Kathmandu.', keywords: 'sugandhika contact, order sugandhika, kathmandu natural products' },
    { pageKey: 'faq', title: 'FAQ | Sugandhika', description: 'Frequently asked questions about Sugandhika products, ordering, delivery, and payment.', keywords: 'sugandhika faq, questions about natural products nepal' },
  ];
  for (const seo of seoPages) {
    await prisma.sEOSetting.upsert({ where: { pageKey: seo.pageKey }, update: {}, create: seo });
  }
  console.log('✅ SEO settings');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Default admin credentials:');
  console.log('  Email:    admin@sugandhika.com');
  console.log('  Password: Admin@1234');
  console.log('\n⚠️  CHANGE THE ADMIN PASSWORD AFTER FIRST LOGIN!\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
