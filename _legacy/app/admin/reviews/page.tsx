import React from "react";
import { prisma } from "@/lib/prisma";
import ReviewManager from "./ReviewManager";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const [reviews, users, products] = await Promise.all([
    prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <ReviewManager
        reviews={reviews}
        users={users}
        products={products}
      />
    </div>
  );
}