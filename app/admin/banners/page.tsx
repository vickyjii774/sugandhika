import React from "react";
import { prisma } from "@/lib/prisma";
import AdminBannerClient from "./AdminBannersClient";

export const revalidate = 0;

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <AdminBannerClient
      initialBanners={banners}
    />
  );
}