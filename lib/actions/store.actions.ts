"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface GetProductsParams {
  query?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price-low" | "price-high" | "rating";
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
}

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const {
      query,
      categorySlug,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = 1,
      limit = 12,
      featuredOnly = false,
    } = params;

    const where: any = {
      isActive: true,
    };

    if (featuredOnly) {
      where.isFeatured = true;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { tags: { contains: query } },
      ];
    }

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price-low") orderBy = { price: "asc" };
    if (sortBy === "price-high") orderBy = { price: "desc" };

    const total = await prisma.product.count({ where });
    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    const formattedProducts = products.map((prod) => {
      const totalRating = prod.reviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = prod.reviews.length > 0 ? totalRating / prod.reviews.length : 5;
      return {
        ...prod,
        avgRating: Number(avgRating.toFixed(1)),
        reviewCount: prod.reviews.length,
      };
    });

    return {
      products: formattedProducts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    return {
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product || !product.isActive) return null;

    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 5;

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        images: true,
        category: true,
        reviews: { where: { isApproved: true } },
      },
    });

    return {
      ...product,
      avgRating: Number(avgRating.toFixed(1)),
      reviewCount: product.reviews.length,
      relatedProducts: relatedProducts.map((p) => ({
        ...p,
        avgRating: p.reviews.length > 0 ? p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length : 5,
        reviewCount: p.reviews.length,
      })),
    };
  } catch (error) {
    return null;
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (error) {
    return [];
  }
}

export async function submitProductReview(data: {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
}) {
  try {
    const review = await prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
        isApproved: true,
      },
    });
    revalidatePath(`/shop`);
    return { success: true, review };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit review." };
  }
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    await prisma.contactMessage.create({
      data,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send message." };
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return { success: true, message: "You are already subscribed!" };
    }

    await prisma.newsletterSubscriber.create({
      data: { email: email.toLowerCase().trim() },
    });
    return { success: true, message: "Thank you for subscribing to Sugandhika updates!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to subscribe." };
  }
}

export async function getHomeData() {
  try {
    const [banners, categories, featuredProducts, testimonials, faqs, settings] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      getProducts({ featuredOnly: true, limit: 8 }),
      prisma.testimonial.findMany({ where: { isFeatured: true }, orderBy: { createdAt: "desc" } }),
      prisma.fAQ.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
      prisma.websiteSettings.findUnique({ where: { id: "default" } }),
    ]);

    return {
      banners: banners || [],
      categories: categories || [],
      featuredProducts: featuredProducts.products || [],
      testimonials: testimonials || [],
      faqs: faqs || [],
      settings,
    };
  } catch (error) {
    return {
      banners: [],
      categories: [],
      featuredProducts: [],
      testimonials: [],
      faqs: [],
      settings: null,
    };
  }
}

export async function getWebsiteSettings() {
  try {
    return await prisma.websiteSettings.findUnique({
      where: { id: "default" },
    });
  } catch (error) {
    return null;
  }
}
