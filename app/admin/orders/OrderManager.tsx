"use client";

import React, { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { updateOrderStatusAction, verifyPaymentAction } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye, QrCode, Truck } from "lucide-react";

export function OrderManager({ orders }: { orders: any[] }) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusFilter === "ALL") return true;
    return o.orderStatus === selectedStatusFilter;
  });

  const handleUpdateStatus = async (orderId: string, status: any) => {
    setIsSubmitting(true);
    const res = await updateOrderStatusAction(orderId, status);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Order status updated to ${status}!`);
    } else {
      toast.error(res.error || "Failed to update status.");
    }
  };

  const handleVerifyPayment = async (orderId: string, isVerified: boolean) => {
    setIsSubmitting(true);
    const res = await verifyPaymentAction(orderId, isVerified);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(isVerified ? "Payment verified successfully!" : "Payment marked as rejected.");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "Failed to verify payment.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusFilter === st
                ? "bg-brand-dark text-white shadow-soft"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Datatable */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ref Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 font-mono">{ord.orderNumber}</td>
                  <td className="p-4">
                    <h5 className="font-bold text-slate-900">{ord.user.name}</h5>
                    <p className="text-[10px] text-slate-400">{ord.user.email}</p>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 block">{ord.paymentMethod}</span>
                      <Badge variant={ord.paymentStatus === "VERIFIED" ? "success" : "warning"}>
                        {ord.paymentStatus}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900">{formatCurrency(ord.finalAmount)}</td>
                  <td className="p-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-4">{formatDate(ord.createdAt)}</td>
                  <td className="p-4 text-right">
                    <Button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setIsModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View & Verify
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Fonepay Verification Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Order Verification (${selectedOrder.orderNumber})`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-brand-cream/60 p-4 rounded-2xl border border-brand-light/20">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Payment Status</span>
                <h4 className="text-sm font-extrabold text-brand-dark">{selectedOrder.paymentStatus}</h4>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Amount</span>
                <h4 className="text-sm font-extrabold text-slate-900">{formatCurrency(selectedOrder.finalAmount)}</h4>
              </div>
            </div>

            {/* Fonepay QR Info section */}
            {selectedOrder.paymentMethod === "FONEPAY_QR" && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase text-brand-light flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> Fonepay Payment Verification
                </h4>
                <div className="text-xs space-y-1">
                  <p>Transaction / Reference ID: <strong className="text-brand-light font-mono">{selectedOrder.transactionId || "Not provided"}</strong></p>
                </div>

                {selectedOrder.paymentScreenshot ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-300 font-semibold">Payment Receipt Screenshot:</p>
                    <img
                      src={selectedOrder.paymentScreenshot}
                      alt="Fonepay Receipt"
                      className="max-h-60 rounded-xl object-contain bg-black border border-slate-700"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No receipt screenshot uploaded.</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleVerifyPayment(selectedOrder.id, true)}
                    variant="gold"
                    size="sm"
                    isLoading={isSubmitting}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Verify Payment
                  </Button>
                  <Button
                    onClick={() => handleVerifyPayment(selectedOrder.id, false)}
                    variant="danger"
                    size="sm"
                    isLoading={isSubmitting}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Items Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">Items Ordered</h4>
              <div className="divide-y divide-slate-100 text-xs">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between">
                    <span>{item.title} x {item.quantity}</span>
                    <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
