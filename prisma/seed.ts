import { PrismaClient, Role, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Sugandhika E-Commerce database...");

  // 1. Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.websiteSettings.deleteMany();

  // 2. Create Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Sugandhika Admin",
      email: "admin@sugandhika.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      phone: "+977 9801234567",
      emailVerified: new Date(),
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "customer@sugandhika.com",
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
      phone: "+977 9841987654",
      emailVerified: new Date(),
      addresses: {
        create: {
          title: "Home",
          fullName: "Aarav Sharma",
          phone: "+977 9841987654",
          street: "Lazimpat Road, House #42",
          city: "Kathmandu",
          state: "Bagmati",
          postalCode: "44600",
          country: "Nepal",
          isDefault: true,
        },
      },
    },
  });

  console.log(`Users created: Admin (${admin.email}), Customer (${customer.email})`);

  // 3. Create Categories
  const categoriesData = [
    {
      name: "Mosquito Killer Stick",
      slug: "mosquito-killer-stick",
      description: "100% natural, eco-friendly mosquito repellent sticks crafted from herbal extracts and essential oils.",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      sortOrder: 1,
    },
    {
      name: "Mosquito Powder",
      slug: "mosquito-powder",
      description: "Organic smoke-less mosquito repellent powder for indoor and outdoor pest control.",
      image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80",
      sortOrder: 2,
    },
    {
      name: "Mosquito Liquid",
      slug: "mosquito-liquid",
      description: "Herbal essential-oil based vaporizing liquid compatible with standard electric diffusers.",
      image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80",
      sortOrder: 3,
    },
    {
      name: "Natural Air Freshener",
      slug: "natural-air-freshener",
      description: "Refreshing room sprays distilled from natural botanical flowers, lemongrass, and citrus oils.",
      image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80",
      sortOrder: 4,
    },
    {
      name: "Herbal Incense",
      slug: "herbal-incense",
      description: "Traditional handmade dhoop and dhoop sticks for spiritual serenity, yoga, and meditation.",
      image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80",
      sortOrder: 5,
    },
    {
      name: "Aroma Products",
      slug: "aroma-products",
      description: "Pure therapeutic-grade essential oils, diffuser liquids, and aromatherapy wax melts.",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      sortOrder: 6,
    },
    {
      name: "Gift Packs",
      slug: "gift-packs",
      description: "Elegantly packaged eco-friendly fragrance gift boxes perfect for festivals and special occasions.",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
      sortOrder: 7,
    },
    {
      name: "Combo Packs",
      slug: "combo-packs",
      description: "High-value combination bundles of mosquito protection and aromatic room fresheners.",
      image: "https://images.unsplash.com/photo-1512290900673-70020041199d?w=800&q=80",
      sortOrder: 8,
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[created.slug] = created.id;
  }
  console.log("8 Categories created successfully.");

  // 4. Create Realistic Products
  const productsData = [
    {
      name: "Sugandhika Herbal Mosquito Killer Incense Stick (Pack of 30)",
      slug: "sugandhika-herbal-mosquito-killer-incense-stick-30",
      description: "Protect your loved ones with 100% natural, chemical-free herbal mosquito killer sticks. Made with citronella, lemongrass, eucalyptus, and neem, these sticks effectively repel mosquitoes while emitting a refreshing natural scent. Safe for kids, pets, and indoor/outdoor use.",
      shortDescription: "100% Chemical-free organic mosquito repellent incense sticks. Pack of 30.",
      price: 350,
      compareAtPrice: 450,
      stock: 120,
      categoryId: categoryMap["mosquito-killer-stick"],
      isFeatured: true,
      tags: "mosquito,herbal,citronella,repellent,eco-friendly",
      images: [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
        "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80",
      ],
    },
    {
      name: "Jumbo Eco Mosquito Protection Sticks (Mega Pack of 60)",
      slug: "jumbo-eco-mosquito-protection-sticks-60",
      description: "Long-burning 12-inch herbal mosquito repellent sticks. Formulated to burn slowly for up to 90 minutes per stick, covering wide garden terraces, balconies, and large living rooms effortlessly.",
      shortDescription: "Ultra long burning 90-min herbal mosquito sticks for wide areas.",
      price: 650,
      compareAtPrice: 800,
      stock: 85,
      categoryId: categoryMap["mosquito-killer-stick"],
      isFeatured: true,
      tags: "mosquito,jumbo,herbal,outdoor,long-burning",
      images: [
        "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80",
      ],
    },
    {
      name: "Organic Anti-Mosquito Fumigation Powder (250g)",
      slug: "organic-anti-mosquito-fumigation-powder-250g",
      description: "Pure botanical mosquito repellent powder blended from dried Camphor, Tulsi, Neem leaves, and Cedarwood. Sprinkle over hot charcoal or ceramic incense burner to immediately purge mosquitoes.",
      shortDescription: "Pure botanical smoke fumigation powder for quick mosquito elimination.",
      price: 420,
      compareAtPrice: 500,
      stock: 60,
      categoryId: categoryMap["mosquito-powder"],
      isFeatured: false,
      tags: "powder,fumigation,mosquito,neem,tulsi",
      images: [
        "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80",
      ],
    },
    {
      name: "Sugandhika Herbal Mosquito Refill Liquid (45ml Twin Pack)",
      slug: "sugandhika-herbal-mosquito-refill-liquid-45ml",
      description: "Non-toxic herbal refill liquid compatible with standard plug-in vaporizers. Formulated with pure Pine extract, Eucalyptus oil, and Citronella. Zero synthetic pyrethroids or toxic fumes.",
      shortDescription: "Plug-in vaporizer liquid refill with 100% natural essential oils.",
      price: 490,
      compareAtPrice: 600,
      stock: 95,
      categoryId: categoryMap["mosquito-liquid"],
      isFeatured: true,
      tags: "liquid,vaporizer,refill,mosquito,natural",
      images: [
        "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80",
      ],
    },
    {
      name: "Royal Himalayan Lavender Natural Air Freshener Spray (200ml)",
      slug: "royal-himalayan-lavender-natural-air-freshener-200ml",
      description: "Transform your living spaces into a calming sanctuary with high-altitude Himalayan Lavender hydrosol and pure essential oil mist. Instantly eliminates odors and relaxes minds.",
      shortDescription: "Relaxing high-altitude Himalayan Lavender organic room spray.",
      price: 580,
      compareAtPrice: 700,
      stock: 50,
      categoryId: categoryMap["natural-air-freshener"],
      isFeatured: true,
      tags: "air freshener,lavender,himalayan,luxury,room spray",
      images: [
        "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80",
      ],
    },
    {
      name: "Zesty Lemongrass & Bergamot Room Mist (200ml)",
      slug: "zesty-lemongrass-bergamot-room-mist-200ml",
      description: "An invigorating blend of organic Lemongrass and fresh Italian Bergamot. Uplifts energy, purifies stagnant indoor air, and leaves a crisp, citrusy aroma for hours.",
      shortDescription: "Energizing citrus & lemongrass room spray for home and office.",
      price: 550,
      compareAtPrice: 650,
      stock: 75,
      categoryId: categoryMap["natural-air-freshener"],
      isFeatured: false,
      tags: "lemongrass,bergamot,freshness,air freshener",
      images: [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      ],
    },
    {
      name: "Handcrafted Organic Sandalwood (Chandan) Dhoop Sticks (40 Pcs)",
      slug: "handcrafted-organic-sandalwood-dhoop-sticks-40",
      description: "Authentic Mysore Sandalwood dhoop sticks made without bamboo core or synthetic fragrance. Provides a soothing, divine aroma for pooja, meditation, and quiet evening reflection.",
      shortDescription: "Pure Mysore Sandalwood bamboo-less traditional dhoop sticks.",
      price: 380,
      compareAtPrice: 480,
      stock: 110,
      categoryId: categoryMap["herbal-incense"],
      isFeatured: true,
      tags: "incense,sandalwood,chandan,dhoop,spiritual",
      images: [
        "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80",
      ],
    },
    {
      name: "Sacred Frankincense & Myrrh Herbal Agarbatti (50 Sticks)",
      slug: "sacred-frankincense-myrrh-herbal-agarbatti-50",
      description: "Hand-rolled agarbatti infused with pure Frankincense resin, Myrrh, and natural flower extracts. Purifies negative energy and leaves a deep, warm ambient fragrance.",
      shortDescription: "Hand-rolled resin incense sticks for spiritual purification.",
      price: 320,
      compareAtPrice: 400,
      stock: 90,
      categoryId: categoryMap["herbal-incense"],
      isFeatured: false,
      tags: "incense,frankincense,agarbatti,herbal",
      images: [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      ],
    },
    {
      name: "Pure Himalayan Eucalyptus Essential Oil (15ml)",
      slug: "pure-himalayan-eucalyptus-essential-oil-15ml",
      description: "100% Pure cold-pressed Eucalyptus Globulus essential oil. Ideal for steam inhalation, diffuser therapy, and natural insect repellent blends.",
      shortDescription: "100% Pure therapeutic grade eucalyptus essential oil.",
      price: 620,
      compareAtPrice: 750,
      stock: 40,
      categoryId: categoryMap["aroma-products"],
      isFeatured: false,
      tags: "essential oil,eucalyptus,aromatherapy,diffuser",
      images: [
        "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80",
      ],
    },
    {
      name: "Sugandhika Luxury Eco Fragrance Gift Box",
      slug: "sugandhika-luxury-eco-fragrance-gift-box",
      description: "The ultimate luxury present! Includes: 1x Lavender Air Freshener, 1x Sandalwood Dhoop Pack, 1x Herbal Mosquito Sticks (Pack of 30), and 1x Ceramic Burner with Brass Holder.",
      shortDescription: "Deluxe holiday gift hamper containing complete eco fragrance collection.",
      price: 1850,
      compareAtPrice: 2400,
      stock: 30,
      categoryId: categoryMap["gift-packs"],
      isFeatured: true,
      tags: "gift box,luxury,hamper,combo,eco-friendly",
      images: [
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
      ],
    },
    {
      name: "Ultimate Home Mosquito Protection Combo Pack",
      slug: "ultimate-home-mosquito-protection-combo-pack",
      description: "Bundle includes: 2x Mosquito Killer Sticks (60 Pcs Total), 1x Herbal Vaporizer Refill Liquid (Twin Pack), and 1x Fumigation Powder (250g). Save 25% with this combo!",
      shortDescription: "Complete 360-degree mosquito defense system for whole home.",
      price: 1250,
      compareAtPrice: 1600,
      stock: 45,
      categoryId: categoryMap["combo-packs"],
      isFeatured: true,
      tags: "combo,mosquito,bundle,savings",
      images: [
        "https://images.unsplash.com/photo-1512290900673-70020041199d?w=800&q=80",
      ],
    },
  ];

  for (const prod of productsData) {
    const { images, ...prodFields } = prod;
    const createdProduct = await prisma.product.create({
      data: prodFields,
    });

    // Create product images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: images[i],
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }

    // Add a review for featured products
    if (prod.isFeatured) {
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: createdProduct.id,
          rating: 5,
          comment: "Absolutely amazing product! Natural, smells pleasant, and effectively repels mosquitoes without any harsh coughing or chemical smoke.",
          isApproved: true,
        },
      });
    }
  }

  console.log("Products and sample reviews created successfully.");

  // 5. Create Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "Pure Eco-Friendly Mosquito Protection",
        subtitle: "100% Chemical-Free Herbal Incense & Organic Fragrances",
        imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&q=80",
        linkUrl: "/shop",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Elevate Your Home Atmosphere",
        subtitle: "Handcrafted Himalayan Lavender Mists & Sandalwood Dhoop",
        imageUrl: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=1600&q=80",
        linkUrl: "/shop?category=natural-air-freshener",
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  // 6. Create FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: "Are Sugandhika mosquito sticks safe for babies and pets?",
        answer: "Yes! All Sugandhika products are made with 100% botanical plant extracts such as Neem, Citronella, and Lemongrass, with zero harmful synthetic chemicals like transfluthrin or DEET.",
        category: "Safety",
        sortOrder: 1,
      },
      {
        question: "How long does a single mosquito incense stick burn?",
        answer: "Our standard Herbal Mosquito Killer sticks burn for approximately 45 to 60 minutes, while our Jumbo Eco sticks burn for up to 90 minutes.",
        category: "Product Info",
        sortOrder: 2,
      },
      {
        question: "What payment methods are supported?",
        answer: "We support Cash on Delivery (COD) across Nepal as well as instant Fonepay QR Code payment at checkout.",
        category: "Payment & Shipping",
        sortOrder: 3,
      },
      {
        question: "How long does delivery take?",
        answer: "Orders within Kathmandu Valley are delivered within 24 hours. Delivery outside Kathmandu Valley typically takes 2-3 business days.",
        category: "Payment & Shipping",
        sortOrder: 4,
      },
    ],
  });

  // 7. Create Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        name: "Prashant K. R.",
        role: "Kathmandu Homeowner",
        content: "Sugandhika mosquito sticks are a game-changer! My kids used to sneeze continuously with chemical repellents, but Sugandhika is so soothing and works amazingly well.",
        rating: 5,
        isFeatured: true,
      },
      {
        name: "Saraswati Adhikari",
        role: "Yoga Practitioner",
        content: "The Mysore Sandalwood dhoop and Himalayan Lavender room spray have become part of my daily morning meditation routine. Pure luxury!",
        rating: 5,
        isFeatured: true,
      },
      {
        name: "Dr. Bikram Thapa",
        role: "Wellness Consultant",
        content: "I recommend Sugandhika to all my patients looking for natural, organic pest management solutions for their homes.",
        rating: 5,
        isFeatured: true,
      },
    ],
  });

  // 8. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 500,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        usageLimit: 500,
      },
      {
        code: "SUGANDHIKA200",
        discountType: DiscountType.FIXED,
        discountValue: 200,
        minOrderAmount: 1500,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
      },
    ],
  });

  // 9. Create Website Settings
  await prisma.websiteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "Sugandhika",
      tagline: "Pure Eco-Friendly Fragrance & Organic Mosquito Solutions",
      contactEmail: "support@sugandhika.com",
      contactPhone: "+977 9801234567",
      address: "Lazimpat, Kathmandu, Nepal",
      facebookUrl: "https://facebook.com/sugandhika.nepal",
      instagramUrl: "https://instagram.com/sugandhika.nepal",
      whatsappNumber: "+977 9801234567",
      freeShippingThreshold: 1500,
      shippingFee: 100,
      fonepayQrUrl: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80",
    },
  });

  console.log("Database successfully seeded with realistic Sugandhika data!");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
