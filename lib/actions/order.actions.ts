"use server";

import { prisma } from "@/lib/prisma";
import { CheckoutSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function validateCoupon(code: string, cartTotal: number) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return { success: false, error: "Invalid or inactive coupon code." };
    }

    if (new Date() > new Date(coupon.validUntil)) {
      return { success: false, error: "Coupon code has expired." };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit reached." };
    }

    if (cartTotal < coupon.minOrderAmount) {
      return {
        success: false,
        error: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      success: true,
      code: coupon.code,
      discountAmount: Math.round(discount),
      message: `Coupon applied! You saved Rs. ${Math.round(discount)}`,
    };
  } catch (error: any) {
    return { success: false, error: "Failed to validate coupon." };
  }
}

export async function createOrder(params: {
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number; title: string; image?: string }>;
  checkoutData: any;
}) {
  try {
    const { userId, items, checkoutData } = params;
    const validated = CheckoutSchema.parse(checkoutData);

    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    // Calculate subtotal
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Settings for shipping fee
    const settings = await prisma.websiteSettings.findUnique({ where: { id: "default" } });
    const freeShippingThreshold = settings?.freeShippingThreshold || 1500;
    const defaultShippingFee = settings?.shippingFee || 100;
    const shippingFee = totalAmount >= freeShippingThreshold ? 0 : defaultShippingFee;

    // Handle coupon
    let discountAmount = 0;
    if (validated.couponCode) {
      const couponResult = await validateCoupon(validated.couponCode, totalAmount);
      if (couponResult.success) {
        discountAmount = couponResult.discountAmount || 0;
        // Increment coupon count
        await prisma.coupon.update({
          where: { code: validated.couponCode.toUpperCase().trim() },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount + shippingFee);

    // Generate unique order number
    const count = await prisma.order.count();
    const orderNumber = `SUG-${new Date().getFullYear()}-${1000 + count + 1}`;

    const shippingAddressJson = JSON.stringify({
      fullName: validated.fullName,
      phone: validated.phone,
      email: validated.email,
      street: validated.street,
      city: validated.city,
      state: validated.state,
      postalCode: validated.postalCode,
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId: validated.addressId || null,
        shippingAddress: shippingAddressJson,
        totalAmount,
        discountAmount,
        shippingFee,
        finalAmount,
        couponCode: validated.couponCode || null,
        paymentMethod: validated.paymentMethod,
        paymentStatus: validated.paymentMethod === "COD" ? "PENDING" : "PENDING",
        orderStatus: "PENDING",
        transactionId: validated.transactionId || null,
        paymentScreenshot: validated.paymentScreenshot || null,
        notes: validated.notes || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image || null,
          })),
        },
        payment: {
          create: {
            paymentMethod: validated.paymentMethod,
            status: "PENDING",
            transactionId: validated.transactionId || null,
            screenshotUrl: validated.paymentScreenshot || null,
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    // Update product stocks
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    revalidatePath("/customer/orders");
    revalidatePath("/admin/orders");

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to place order." };
  }
}

export async function getUserOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
      payment: true,
    },
  });
}

export async function getOrderDetails(orderId: string, userId?: string) {
  const where: any = { id: orderId };
  if (userId) where.userId = userId;

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
      payment: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  return order;
}
