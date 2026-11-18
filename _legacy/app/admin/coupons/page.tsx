import React from "react";
import { prisma } from "@/lib/prisma";
import { CouponManager } from "./CouponManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Coupons & Discounts</h1>
        <p className="text-xs text-slate-500">Create promo codes for store checkout</p>
      </div>

      <CouponManager coupons={coupons} />
    </div>
  );
}
