import React from "react";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await prisma.websiteSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Website & Fonepay Settings</h1>
        <p className="text-xs text-slate-500">Configure store info, free shipping thresholds, and Fonepay QR code</p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
