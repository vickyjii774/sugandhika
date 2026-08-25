"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  createCouponAction,
  deleteCouponAction,
} from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export function CouponManager({ coupons }: { coupons: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE"
  );

  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(500);
  const [validUntil, setValidUntil] = useState("2026-12-31");
  const [usageLimit, setUsageLimit] = useState<number>(200);

  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!code.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    if (discountValue < 0) {
      toast.error("Discount value cannot be negative.");
      return;
    }

    if (minOrderAmount < 0) {
      toast.error("Minimum order amount cannot be negative.");
      return;
    }

    if (usageLimit < 0) {
      toast.error("Usage limit cannot be negative.");
      return;
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%.");
      return;
    }

    if (!validUntil) {
      toast.error("Please select a valid expiry date.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await createCouponAction({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        validUntil,
        usageLimit: Number(usageLimit),
      });

      if (res.success) {
        toast.success("Coupon code created!");

        // Reset form
        setCode("");
        setDiscountType("PERCENTAGE");
        setDiscountValue(10);
        setMinOrderAmount(500);
        setValidUntil("2026-12-31");
        setUsageLimit(200);

        setIsModalOpen(false);
      } else {
        toast.error(res.error || "Failed to create coupon.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete coupon?")) return;

    try {
      const res = await deleteCouponAction(id);

      if (res.success) {
        toast.success("Coupon deleted.");
      } else {
        toast.error(res.error || "Failed to delete coupon.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons Table */}
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
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/50"
                >
                  <td className="p-4 font-extrabold text-brand-dark font-mono uppercase">
                    {c.code}
                  </td>

                  <td className="p-4 font-bold text-slate-900">
                    {c.discountType === "PERCENTAGE"
                      ? `${c.discountValue}% OFF`
                      : `Rs. ${c.discountValue} OFF`}
                  </td>

                  <td className="p-4">
                    {formatCurrency(c.minOrderAmount)}
                  </td>

                  <td className="p-4">
                    {c.usedCount} / {c.usageLimit}
                  </td>

                  <td className="p-4">
                    {formatDate(c.validUntil)}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      aria-label={`Delete coupon ${c.code}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-slate-400"
                  >
                    No coupons available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Coupon Code"
      >
        <form
          onSubmit={handleCreate}
          className="space-y-4"
        >
          {/* Coupon Code */}
          <Input
            label="Coupon Code *"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. ECOGREEN20"
            className="uppercase font-bold"
          />

          {/* Discount Type + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Discount Type
              </label>

              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(
                    e.target.value as "PERCENTAGE" | "FIXED"
                  )
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              >
                <option value="PERCENTAGE">
                  Percentage (%)
                </option>

                <option value="FIXED">
                  Fixed Amount (Rs.)
                </option>
              </select>
            </div>

            <Input
              label="Discount Value *"
              type="number"
              min={0}
              max={discountType === "PERCENTAGE" ? 100 : undefined}
              step="0.01"
              required
              value={discountValue}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (Number.isNaN(value)) {
                  setDiscountValue(0);
                  return;
                }

                const max =
                  discountType === "PERCENTAGE" ? 100 : Infinity;

                setDiscountValue(
                  Math.min(max, Math.max(0, value))
                );
              }}
            />
          </div>

          {/* Minimum Order + Usage Limit */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Order Amount (Rs.)"
              type="number"
              min={0}
              step="0.01"
              value={minOrderAmount}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (Number.isNaN(value)) {
                  setMinOrderAmount(0);
                  return;
                }

                setMinOrderAmount(Math.max(0, value));
              }}
            />

            <Input
              label="Usage Limit"
              type="number"
              min={0}
              step="1"
              value={usageLimit}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (Number.isNaN(value)) {
                  setUsageLimit(0);
                  return;
                }

                setUsageLimit(Math.max(0, Math.floor(value)));
              }}
            />
          </div>

          {/* Valid Until */}
          <Input
            label="Valid Until *"
            type="date"
            required
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            className="w-full"
          >
            Save Coupon
          </Button>
        </form>
      </Modal>
    </div>
  );
}