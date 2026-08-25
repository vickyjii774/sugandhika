"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
} from "./actions";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  product: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Product {
  id: string;
  name: string;
}

interface ReviewManagerProps {
  reviews: Review[];
  users: User[];
  products: Product[];
}

export default function ReviewManager({
  reviews,
  users,
  products,
}: ReviewManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const [rating, setRating] = useState(5);

  const openCreateModal = () => {
    setEditingReview(null);
    setRating(5);
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setIsModalOpen(true);
  };

  const openDeleteModal = (review: Review) => {
    setDeletingReview(review);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setRating(5);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingReview(null);
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Customer Reviews Moderation
          </h1>

          <p className="text-xs text-slate-500">
            Create, edit and manage customer product feedback
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Review
        </Button>
      </div>

      {/* REVIEW TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare size={32} />

                      <p>No reviews found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* CUSTOMER */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {review.user.name || "Unknown Customer"}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {review.user.email}
                        </p>
                      </div>
                    </td>

                    {/* PRODUCT */}
                    <td className="p-4 font-semibold text-slate-800">
                      {review.product.name}
                    </td>

                    {/* RATING */}
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>
                    </td>

                    {/* COMMENT */}
                    <td className="p-4 max-w-xs">
                      <p className="truncate italic text-slate-600">
                        "{review.comment}"
                      </p>
                    </td>

                    {/* DATE */}
                    <td className="p-4 whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(review)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Review"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(review)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <div className="p-6">
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingReview ? "Edit Review" : "Add Review"}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {editingReview
                  ? "Update customer feedback"
                  : "Create customer feedback"}
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* FORM */}
          <form
            action={async (formData) => {
              try {
                if (editingReview) {
                  formData.set("id", editingReview.id);

                  await updateReviewAction(formData);
                } else {
                  await createReviewAction(formData);
                }

                closeModal();
              } catch (error) {
                alert(
                  error instanceof Error
                    ? error.message
                    : "Something went wrong."
                );
              }
            }}
            className="space-y-5"
          >
            {/* CUSTOMER */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Customer
              </label>

              <select
                name="userId"
                defaultValue={editingReview?.user.id || ""}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
              >
                <option value="">Select customer</option>

                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name || "Unnamed"} — {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* PRODUCT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Product
              </label>

              <select
                name="productId"
                defaultValue={editingReview?.product.id || ""}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
              >
                <option value="">Select product</option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* RATING */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Rating
              </label>

              <input
                type="hidden"
                name="rating"
                value={rating}
              />

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="p-1"
                  >
                    <Star
                      size={28}
                      className={
                        value <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}

                <span className="ml-2 text-sm font-semibold text-slate-600">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* COMMENT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Comment
              </label>

              <textarea
                name="comment"
                defaultValue={editingReview?.comment || ""}
                required
                rows={5}
                placeholder="Write customer review..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-green-500"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={closeModal}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </Button>

              <Button type="submit">
                {editingReview ? "Update Review" : "Create Review"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Delete Review
            </h2>

            <button
              type="button"
              onClick={closeDeleteModal}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to delete this review?
            This action cannot be undone.
          </p>

          {deletingReview && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="font-bold text-slate-900">
                {deletingReview.user.name || "Unknown Customer"}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {deletingReview.product.name}
              </p>

              <p className="text-sm text-slate-600 mt-2 italic">
                "{deletingReview.comment}"
              </p>
            </div>
          )}

          <form
            action={async (formData) => {
              try {
                if (!deletingReview) return;

                formData.set("id", deletingReview.id);

                await deleteReviewAction(formData);

                closeDeleteModal();
              } catch (error) {
                alert(
                  error instanceof Error
                    ? error.message
                    : "Failed to delete review."
                );
              }
            }}
          >
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={closeDeleteModal}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Review
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}