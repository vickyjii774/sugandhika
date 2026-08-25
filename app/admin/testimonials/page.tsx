import React from "react";
import { prisma } from "@/lib/prisma";
import TestimonialManager from "./TestimonialManager";

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const testimonialData = await prisma.testimonial.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const testimonials = testimonialData.map((t) => ({
    ...t,
    image: t.avatar,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <TestimonialManager testimonials={testimonials} />
    </div>
  );
}