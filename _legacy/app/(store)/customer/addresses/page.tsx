import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { AddressForm } from "./AddressForm";

export default async function CustomerAddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Address Book</h1>
        <p className="text-xs text-slate-500 mt-1">Manage delivery addresses for faster checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {addresses.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-soft text-slate-500 text-xs">
              No saved addresses. Use the form to save a delivery address.
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-dark" />
                    <h4 className="text-sm font-bold text-slate-900">{addr.title}</h4>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-light/20 text-brand-dark text-[10px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  <p className="font-semibold text-slate-800">{addr.fullName} ({addr.phone})</p>
                  <p>{addr.street}, {addr.city}</p>
                  <p>{addr.state}, {addr.postalCode}, {addr.country}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <AddressForm userId={userId} />
        </div>
      </div>
    </div>
  );
}
