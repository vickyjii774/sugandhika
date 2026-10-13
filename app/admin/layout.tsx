import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set this server-only variable after the Django owner dashboard is deployed
  // and the owner account has been provisioned. Until then, keep the existing
  // NextAuth/Prisma dashboard available for staging.
  const djangoOwnerDashboardUrl = process.env.DJANGO_OWNER_DASHBOARD_URL?.trim();
  if (djangoOwnerDashboardUrl) {
    let target: URL;
    try {
      target = new URL(djangoOwnerDashboardUrl);
    } catch {
      throw new Error("DJANGO_OWNER_DASHBOARD_URL must be an absolute URL.");
    }

    if (
      process.env.NODE_ENV === "production" &&
      target.protocol !== "https:"
    ) {
      throw new Error("DJANGO_OWNER_DASHBOARD_URL must use HTTPS in production.");
    }

    redirect(target.toString());
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
