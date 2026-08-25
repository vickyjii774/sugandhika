"use client";

import React, { useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Upload,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "./actions";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  image: string | null;
  createdAt: Date;
}

interface TestimonialManagerProps {
  testimonials: Testimonial[];
}

export default function TestimonialManager({
  testimonials,
}: TestimonialManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);

  const [deletingTestimonial, setDeletingTestimonial] =
    useState<Testimonial | null>(null);

  const [rating, setRating] = useState(5);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setRating(5);
    setPreviewImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setRating(testimonial.rating);
    setPreviewImage(testimonial.image || null);

    setIsModalOpen(true);
  };

  const openDeleteModal = (testimonial: Testimonial) => {
    setDeletingTestimonial(testimonial);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setPreviewImage(null);
    setRating(5);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTestimonial(null);
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    const preview = URL.createObjectURL(file);

    setPreviewImage(preview);
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Customer Testimonials
          </h1>

          <p className="text-xs text-slate-500">
            Manage social proof testimonials shown on homepage
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Testimonial
        </Button>
      </div>

      {/* TESTIMONIAL GRID */}
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <ImageIcon size={40} />

            <p className="text-sm">
              No testimonials found.
            </p>

            <Button
              type="button"
              onClick={openCreateModal}
            >
              <Plus size={16} className="mr-2" />
              Add First Testimonial
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden"
            >
              {/* IMAGE */}
              <div className="h-48 bg-slate-50 relative flex items-center justify-center">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <ImageIcon size={36} />

                    <span className="text-xs">
                      No photo
                    </span>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-6 space-y-3">
                {/* RATING */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className={
                        index < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }
                    />
                  ))}
                </div>

                {/* CONTENT */}
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* CUSTOMER */}
                <div className="pt-3 border-t border-slate-100">
                  <h5 className="font-bold text-xs text-slate-900">
                    {testimonial.name}
                  </h5>

                  {testimonial.role && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {testimonial.role}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(testimonial)
                    }
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    title="Edit Testimonial"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openDeleteModal(testimonial)
                    }
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    title="Delete Testimonial"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingTestimonial
                  ? "Edit Testimonial"
                  : "Add Testimonial"}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {editingTestimonial
                  ? "Update customer testimonial"
                  : "Create a new customer testimonial"}
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* FORM */}
          <form
            action={async (formData) => {
              try {
                if (editingTestimonial) {
                  formData.set(
                    "id",
                    editingTestimonial.id
                  );

                  await updateTestimonialAction(formData);
                } else {
                  await createTestimonialAction(formData);
                }

                closeModal();

                window.location.reload();
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
            {/* NAME */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Customer Name
              </label>

              <input
                type="text"
                name="name"
                defaultValue={
                  editingTestimonial?.name || ""
                }
                required
                placeholder="e.g. Sita Sharma"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
              />
            </div>

            {/* ROLE */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Role / Position
              </label>

              <input
                type="text"
                name="role"
                defaultValue={
                  editingTestimonial?.role || ""
                }
                placeholder="e.g. Customer"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
              />
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

            {/* PHOTO */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Customer Photo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-green-400 hover:bg-green-50/30 transition"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload
                    size={24}
                    className="text-slate-400"
                  />

                  <span className="text-xs font-semibold text-slate-600">
                    Click to upload photo
                  </span>

                  <span className="text-[10px] text-slate-400">
                    JPG, PNG or WEBP · Max 5MB
                  </span>
                </div>
              </button>

              {/* IMAGE PREVIEW */}
              {previewImage && (
                <div className="mt-4 relative w-24 h-24">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl object-cover border border-slate-200"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Testimonial
              </label>

              <textarea
                name="content"
                defaultValue={
                  editingTestimonial?.content || ""
                }
                required
                rows={6}
                placeholder="Write customer testimonial..."
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
                {editingTestimonial
                  ? "Update Testimonial"
                  : "Create Testimonial"}
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
              Delete Testimonial
            </h2>

            <button
              type="button"
              onClick={closeDeleteModal}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to delete this
            testimonial? This action cannot be undone.
          </p>

          {deletingTestimonial && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="font-bold text-slate-900">
                {deletingTestimonial.name}
              </p>

              <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                {deletingTestimonial.content}
              </p>
            </div>
          )}

          <form
            action={async (formData) => {
              try {
                if (!deletingTestimonial) return;

                formData.set(
                  "id",
                  deletingTestimonial.id
                );

                await deleteTestimonialAction(formData);

                closeDeleteModal();

                window.location.reload();
              } catch (error) {
                alert(
                  error instanceof Error
                    ? error.message
                    : "Failed to delete testimonial."
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
                <Trash2
                  size={16}
                  className="mr-2"
                />

                Delete Testimonial
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}