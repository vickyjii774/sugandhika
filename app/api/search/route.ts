import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ],
    },
    take: 6,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return NextResponse.json({ products });
}
