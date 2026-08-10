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

export async function deleteCategoryAction(categoryId: string) {
  try {
    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category." };
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
export async function updateWebsiteSettingsAction(data: {
  siteName?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  freeShippingThreshold?: number;
  shippingFee?: number;
  fonepayQrUrl?: string;
}) {
  try {
    const settings = await prisma.websiteSettings.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        ...data,
      },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update website settings." };
  }
}
