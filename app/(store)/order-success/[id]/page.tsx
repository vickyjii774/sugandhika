import React from "react";
import { getOrderDetails } from "@/lib/actions/order.actions";
import OrderSuccessClient from "@/components/store/OrderSuccessClient";

interface OrderSuccessProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Order Placed Successfully | Sugandhika Natural Wellness",
  description: "Thank you for your order. We are preparing your herbal products for shipment.",
};

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { id } = await params;
  let order = null;

  try {
    order = await getOrderDetails(id);
  } catch {
    // Order might exist in Django database instead of Prisma
  }

  return <OrderSuccessClient orderNumber={id} initialOrder={order as any} />;
}
