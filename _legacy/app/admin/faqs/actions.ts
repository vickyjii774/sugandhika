"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFAQAction(formData: FormData) {
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder"));

  if (!question) {
    throw new Error("Question is required.");
  }

  if (!answer) {
    throw new Error("Answer is required.");
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Sort order must be a non-negative whole number.");
  }

  await prisma.fAQ.create({
    data: {
      question,
      answer,
      sortOrder,
    },
  });

  revalidatePath("/admin/faqs");
}

export async function updateFAQAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder"));

  if (!id) {
    throw new Error("FAQ ID is missing.");
  }

  if (!question) {
    throw new Error("Question is required.");
  }

  if (!answer) {
    throw new Error("Answer is required.");
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Sort order must be a non-negative whole number.");
  }

  await prisma.fAQ.update({
    where: {
      id,
    },
    data: {
      question,
      answer,
      sortOrder,
    },
  });

  revalidatePath("/admin/faqs");
}

export async function deleteFAQAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("FAQ ID is missing.");
  }

  await prisma.fAQ.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/faqs");
}