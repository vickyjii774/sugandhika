"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReviewAction(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  const productId = String(formData.get("productId") || "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();

  if (!userId) {
    throw new Error("Please select a customer.");
  }

  if (!productId) {
    throw new Error("Please select a product.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  if (!comment) {
    throw new Error("Comment is required.");
  }

  await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
  });

  revalidatePath("/admin/reviews");
}

export async function updateReviewAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const userId = String(formData.get("userId") || "");
  const productId = String(formData.get("productId") || "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();

  if (!id) {
    throw new Error("Review ID is missing.");
  }

  if (!userId) {
    throw new Error("Please select a customer.");
  }

  if (!productId) {
    throw new Error("Please select a product.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  if (!comment) {
    throw new Error("Comment is required.");
  }

  await prisma.review.update({
    where: {
      id,
    },
    data: {
      userId,
      productId,
      rating,
      comment,
    },
  });

  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Review ID is missing.");
  }

  await prisma.review.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/reviews");
}