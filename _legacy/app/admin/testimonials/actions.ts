"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTestimonialAction(
  formData: FormData
) {
  const name = String(
    formData.get("name") || ""
  ).trim();

  const role = String(
    formData.get("role") || ""
  ).trim();

  const content = String(
    formData.get("content") || ""
  ).trim();

  const rating = Number(
    formData.get("rating")
  );

  const image = formData.get("image");

  if (!name) {
    throw new Error("Customer name is required.");
  }

  if (!content) {
    throw new Error("Testimonial content is required.");
  }

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error(
      "Rating must be between 1 and 5."
    );
  }

  let imageUrl: string | null = null;

  if (
    image instanceof File &&
    image.size > 0
  ) {
    // Cloudinary upload goes here.
  }

  const createData: any = {
    name,
    role: role || null,
    content,
    rating,
  };
  if (imageUrl !== null) {
    createData.image = imageUrl;
  }

  await prisma.testimonial.create({
    data: createData,
  });

  revalidatePath("/admin/testimonials");
}

export async function updateTestimonialAction(
  formData: FormData
) {
  const id = String(
    formData.get("id") || ""
  );

  const name = String(
    formData.get("name") || ""
  ).trim();

  const role = String(
    formData.get("role") || ""
  ).trim();

  const content = String(
    formData.get("content") || ""
  ).trim();

  const rating = Number(
    formData.get("rating")
  );

  const image = formData.get("image");

  if (!id) {
    throw new Error(
      "Testimonial ID is missing."
    );
  }

  if (!name) {
    throw new Error("Customer name is required.");
  }

  if (!content) {
    throw new Error(
      "Testimonial content is required."
    );
  }

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error(
      "Rating must be between 1 and 5."
    );
  }

  const existing =
    await prisma.testimonial.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "Testimonial not found."
    );
  }

  let imageUrl = existing.avatar;

  if (
    image instanceof File &&
    image.size > 0
  ) {
    // Cloudinary upload goes here.
  }

  const updateData: any = {
    name,
    role: role || null,
    content,
    rating,
  };
  if (imageUrl !== null) {
    updateData.image = imageUrl;
  }

  await prisma.testimonial.update({
    where: {
      id,
    },
    data: updateData,
  });

  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonialAction(
  formData: FormData
) {
  const id = String(
    formData.get("id") || ""
  );

  if (!id) {
    throw new Error(
      "Testimonial ID is missing."
    );
  }

  await prisma.testimonial.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/testimonials");
}
