"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function getAdminDashboardStats() {
  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCustomers,
    orders,
    recentOrders,
    settings,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      where: { orderStatus: { not: "CANCELLED" } },
      select: { finalAmount: true, createdAt: true, paymentStatus: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        payment: true,
      },
    }),
    prisma.websiteSettings.findUnique({ where: { id: "default" } }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);

  // Group revenue by month for Recharts
  const monthlyDataMap: Record<string, number> = {};
  orders.forEach((o) => {
    const month = new Date(o.createdAt).toLocaleString("en-US", { month: "short" });
    monthlyDataMap[month] = (monthlyDataMap[month] || 0) + o.finalAmount;
  });

  const chartData = Object.keys(monthlyDataMap).map((m) => ({
    month: m,
    revenue: monthlyDataMap[m],
  }));

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCustomers,
    chartData: chartData.length > 0 ? chartData : [{ month: "Current", revenue: totalRevenue }],
    recentOrders,
    settings,
  };
}

// Products CRUD
export async function createProductAction(data: {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  tags?: string;
  images: string[];
}) {
  try {
    const slug = slugify(data.name) + "-" + Math.floor(Math.random() * 1000);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        stock: data.stock,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        tags: data.tags || null,
        images: {
          create: data.images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create product." };
  }
}

export async function updateProductAction(
  productId: string,
  data: {
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    categoryId: string;
    isFeatured: boolean;
    isActive: boolean;
    tags?: string;
    images?: string[];
  }
) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        stock: data.stock,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        tags: data.tags || null,
      },
    });

    if (data.images && data.images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId } });
      for (let i = 0; i < data.images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId,
            url: data.images[i],
            isPrimary: i === 0,
            sortOrder: i,
          },
        });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product." };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete product." };
  }
}

// Categories CRUD
export async function createCategoryAction(data: {
  name: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}) {
  try {
    const slug = slugify(data.name);
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        sortOrder: data.sortOrder || 0,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category." };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  data: {
    name: string;
    description?: string;
    image?: string;
    sortOrder?: number;
  }
) {
  try {
    const slug = slugify(data.name);

    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        sortOrder: Math.max(0, data.sortOrder ?? 0),
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");

    return {
      success: true,
      category,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to update category.",
    };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category." };
  }
}

// Banners CRUD

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateBannerInput {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export async function createBannerAction(data: CreateBannerInput) {
  try {
    const title = data.title.trim();

    if (!title) {
      return {
        success: false,
        error: "Banner title is required.",
      };
    }

    if (!data.imageUrl?.trim()) {
      return {
        success: false,
        error: "Banner image is required.",
      };
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: data.subtitle?.trim() || null,
        imageUrl: data.imageUrl.trim(),
        linkUrl: data.linkUrl?.trim() || null,
        isActive: data.isActive ?? true,
        sortOrder: Math.max(0, data.sortOrder ?? 0),
      },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
      banner,
    };
  } catch (error: any) {
    console.error("Create banner error:", error);

    return {
      success: false,
      error: error?.message || "Failed to create banner.",
    };
  }
}

export async function updateBannerAction(
  bannerId: string,
  data: UpdateBannerInput
) {
  try {
    if (!bannerId) {
      return {
        success: false,
        error: "Banner ID is required.",
      };
    }

    const title = data.title.trim();

    if (!title) {
      return {
        success: false,
        error: "Banner title is required.",
      };
    }

    const existingBanner = await prisma.banner.findUnique({
      where: {
        id: bannerId,
      },
    });

    if (!existingBanner) {
      return {
        success: false,
        error: "Banner not found.",
      };
    }

    const banner = await prisma.banner.update({
      where: {
        id: bannerId,
      },
      data: {
        title,
        subtitle: data.subtitle?.trim() || null,

        // Keep the existing image if no new image was provided
        ...(data.imageUrl !== undefined
          ? {
              imageUrl: data.imageUrl.trim(),
            }
          : {}),

        linkUrl: data.linkUrl?.trim() || null,
        isActive: data.isActive ?? existingBanner.isActive,
        sortOrder: Math.max(
          0,
          data.sortOrder ?? existingBanner.sortOrder
        ),
      },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
      banner,
    };
  } catch (error: any) {
    console.error("Update banner error:", error);

    return {
      success: false,
      error: error?.message || "Failed to update banner.",
    };
  }
}

export async function deleteBannerAction(bannerId: string) {
  try {
    if (!bannerId) {
      return {
        success: false,
        error: "Banner ID is required.",
      };
    }

    const existingBanner = await prisma.banner.findUnique({
      where: {
        id: bannerId,
      },
    });

    if (!existingBanner) {
      return {
        success: false,
        error: "Banner not found.",
      };
    }

    await prisma.banner.delete({
      where: {
        id: bannerId,
      },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete banner error:", error);

    return {
      success: false,
      error: error?.message || "Failed to delete banner.",
    };
  }
}


// Orders Management
export async function updateOrderStatusAction(orderId: string, status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED") {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update order status." };
  }
}

export async function verifyPaymentAction(orderId: string, isVerified: boolean, notes?: string) {
  try {
    const status = isVerified ? "VERIFIED" : "REJECTED";
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status,
        payment: {
          update: {
            status,
            verifiedAt: isVerified ? new Date() : null,
            notes: notes || (isVerified ? "Fonepay transaction verified by admin." : "Payment verification rejected."),
          },
        },
      },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update payment status." };
  }
}

// Coupons CRUD
export async function createCouponAction(data: {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit: number;
}) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount || null,
        validUntil: new Date(data.validUntil),
        usageLimit: data.usageLimit,
      },
    });
    revalidatePath("/admin/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create coupon." };
  }
}

export async function deleteCouponAction(couponId: string) {
  try {
    await prisma.coupon.delete({ where: { id: couponId } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupon." };
  }
}

// Settings Update (Fonepay QR, Shipping Fees)
export interface SocialLinkInput {
  name: string;
  url: string;
}

export interface ContactInfoInput {
  title: string;
  detail: string;
}

export interface UpdateWebsiteSettingsInput {
  siteName?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  freeShippingThreshold?: number;
  shippingFee?: number;
  fonepayQrUrl?: string;
  socialLinks?: SocialLinkInput[];
  extraContacts?: ContactInfoInput[];
  extraDetails?: ContactInfoInput[];
}

export async function updateWebsiteSettingsAction(
  settings: UpdateWebsiteSettingsInput
) {
  try {
    const updatedSettings = await prisma.websiteSettings.update({
      where: { id: "default" },
      data: {
        ...settings,
        socialLinks: {
          deleteMany: {}, // Clear existing social links
          create: settings.socialLinks?.map((link) => ({
            name: link.name,
            url: link.url,
          })),
        },
        extraContacts: {
          deleteMany: {}, // Clear existing extra contacts
          create: settings.extraContacts?.map((contact) => ({
            title: contact.title,
            detail: contact.detail,
          })),
        },
        extraDetails: {
          deleteMany: {}, // Clear existing extra details
          create: settings.extraDetails?.map((detail) => ({
            title: detail.title,
            detail: detail.detail,
          })),
        },
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true, settings: updatedSettings };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update website settings." };
  }
}
