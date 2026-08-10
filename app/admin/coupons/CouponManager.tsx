"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createCouponAction, deleteCouponAction } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { Plus, Trash2, Tag } from "lucide-react";

export function CouponManager({ coupons }: { coupons: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(500);
  const [validUntil, setValidUntil] = useState("2026-12-31");
  const [usageLimit, setUsageLimit] = useState(200);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createCouponAction({
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      validUntil,
      usageLimit: Number(usageLimit),
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Coupon code created!");
      setCode("");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "Failed to create coupon.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete coupon?")) {
      const res = await deleteCouponAction(id);
      if (res.success) toast.success("Coupon deleted.");
      else toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Create Coupon
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Used / Limit</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-extrabold text-brand-dark font-mono uppercase">{c.code}</td>
                  <td className="p-4 font-bold text-slate-900">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `Rs. ${c.discountValue} OFF`}
                  </td>
                  <td className="p-4">{formatCurrency(c.minOrderAmount)}</td>
                  <td className="p-4">{c.usedCount} / {c.usageLimit}</td>
                  <td className="p-4">{formatDate(c.validUntil)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Coupon Code">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Coupon Code *" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. ECOGREEN20" className="uppercase font-bold" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (Rs.)</option>
              </select>
            </div>
            <Input label="Discount Value *" type="number" required value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Order Amount (Rs.)" type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(Number(e.target.value))} />
            <Input label="Usage Limit" type="number" value={usageLimit} onChange={(e) => setUsageLimit(Number(e.target.value))} />
          </div>
          <Input label="Valid Until *" type="date" required value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          <Button type="submit" variant="primary" isLoading={submitting} className="w-full">
            Save Coupon
          </Button>
        </form>
      </Modal>
    </div>
  );
}
