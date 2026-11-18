"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
} from "@/lib/actions/admin.actions";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  sortOrder: number;
}

interface AdminBannersPageProps {
  initialBanners: Banner[];
}

export default function AdminBannersPage({
  initialBanners,
}: AdminBannersPageProps) {
  const [banners, setBanners] =
    useState<Banner[]>(initialBanners);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingBanner, setEditingBanner] =
    useState<Banner | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  /*
   * =========================
   * RESET FORM
   * =========================
   */
  const resetForm = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setSortOrder(0);
  };

  /*
   * =========================
   * OPEN CREATE
   * =========================
   */
  const openCreateModal = () => {
    if (banners.length >= 5) {
      toast.error(
        "You can only have a maximum of 5 banners."
      );
      return;
    }

    resetForm();

    setSortOrder(banners.length);

    setIsModalOpen(true);
  };

  /*
   * =========================
   * OPEN EDIT
   * =========================
   */
  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);

    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setImageUrl(banner.imageUrl);
    setSortOrder(banner.sortOrder);

    setIsModalOpen(true);
  };

  /*
   * =========================
   * CLOSE MODAL
   * =========================
   */
  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    resetForm();
  };

  /*
   * =========================
   * IMAGE SELECT
   * =========================
   *
   * This creates a preview only.
   * Replace the upload part with your
   * existing image-upload system.
   */
  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image must be smaller than 5MB."
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImageUrl(previewUrl);
  };

  /*
   * =========================
   * CREATE / UPDATE
   * =========================
   */
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a banner title.");
      return;
    }

    if (!imageUrl.trim()) {
      toast.error("Please select a banner image.");
      return;
    }

    if (sortOrder < 0) {
      toast.error(
        "Display order cannot be negative."
      );
      return;
    }

    setSubmitting(true);

    try {
      /*
       * EDIT
       */
      if (editingBanner) {
       const res = await updateBannerAction(editingBanner.id, {
  title: title.trim(),
  subtitle: subtitle.trim(),
  imageUrl,
  sortOrder: Math.max(
    0,
    Math.floor(sortOrder)
  ),
});

        if (!res.success) {
          toast.error(
            res.error ||
              "Failed to update banner."
          );
          return;
        }

        const updatedBanner: Banner = {
          ...editingBanner,
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          imageUrl,
          sortOrder: Math.max(
            0,
            Math.floor(sortOrder)
          ),
        };

        setBanners((current) =>
          current
            .map((banner) =>
              banner.id === editingBanner.id
                ? updatedBanner
                : banner
            )
            .sort(
              (a, b) =>
                a.sortOrder - b.sortOrder
            )
        );

        toast.success(
          "Banner updated successfully."
        );
      }

      /*
       * CREATE
       */
      else {
        if (banners.length >= 5) {
          toast.error(
            "You can only have a maximum of 5 banners."
          );
          return;
        }

        const res = await createBannerAction({
          title: title.trim(),
          subtitle: subtitle.trim(),
          imageUrl,
          sortOrder: Math.max(
            0,
            Math.floor(sortOrder)
          ),
        });

        if (!res.success) {
          toast.error(
            res.error ||
              "Failed to create banner."
          );
          return;
        }

        toast.success(
          "Banner created successfully."
        );
      }

      setIsModalOpen(false);
      resetForm();

      /*
       * Refresh server data.
       */
      window.location.reload();
    } catch (error) {
      console.error(
        "BANNER SUBMIT ERROR:",
        error
      );

      toast.error(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =========================
   * DELETE
   * =========================
   */
  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) return;

    try {
      const res =
        await deleteBannerAction(id);

      if (!res.success) {
        toast.error(
          res.error ||
            "Failed to delete banner."
        );
        return;
      }

      setBanners((current) =>
        current.filter(
          (banner) => banner.id !== id
        )
      );

      toast.success(
        "Banner deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE BANNER ERROR:",
        error
      );

      toast.error(
        "Something went wrong."
      );
    }
  };

  /*
   * =========================
   * RENDER
   * =========================
   */
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Home Banners
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Manage hero banners and campaign
            graphics.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateModal}
          variant="primary"
          size="sm"
          disabled={banners.length >= 5}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Banner
        </Button>
      </div>

      {/* BANNER COUNT */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-soft">
        <div>
          <p className="text-sm font-bold text-slate-800">
            Homepage Banners
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Maximum 5 banners can be displayed.
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-700">
          {banners.length} / 5
        </div>
      </div>

      {/* EMPTY STATE */}
      {banners.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />

          <h3 className="mt-4 font-bold text-slate-700">
            No banners available
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Add your first homepage hero banner.
          </p>

          <Button
            type="button"
            onClick={openCreateModal}
            variant="primary"
            size="sm"
            className="mt-5"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Banner
          </Button>
        </div>
      )}

      {/* BANNERS */}
      {banners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners
            .sort(
              (a, b) =>
                a.sortOrder - b.sortOrder
            )
            .map((banner, index) => (
              <div
                key={banner.id}
                className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-soft"
              >
                {/* IMAGE */}
                <div className="relative h-72">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* POSITION */}
                  <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                    Banner {index + 1}
                  </div>

                  {/* ACTIONS */}
                  <div className="absolute top-4 right-4 flex gap-2">

                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          banner
                        )
                      }
                      className="rounded-xl bg-white/90 p-2.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
                      aria-label="Edit banner"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          banner.id
                        )
                      }
                      className="rounded-xl bg-white/90 p-2.5 text-red-500 transition hover:bg-white hover:text-red-600"
                      aria-label="Delete banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* TEXT */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-xl font-extrabold">
                      {banner.title}
                    </h3>

                    {banner.subtitle && (
                      <p className="mt-1 text-sm text-white/80">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingBanner
            ? "Edit Homepage Banner"
            : "Create Homepage Banner"
        }
        maxWidth="lg"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* TITLE */}
          <Input
            label="Banner Title *"
            required
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="e.g. Natural Protection for Your Family"
          />

          {/* SUBTITLE */}
          <Input
            label="Banner Subtitle"
            value={subtitle}
            onChange={(e) =>
              setSubtitle(e.target.value)
            }
            placeholder="Enter a short description"
          />

          {/* IMAGE */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Banner Image *
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
            />

            <p className="text-[11px] text-slate-400">
              Recommended wide landscape image.
              Maximum 5MB.
            </p>

            {imageUrl && (
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={imageUrl}
                  alt="Banner preview"
                  className="aspect-[16/6] w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* SORT ORDER */}
          <Input
            label="Display Order"
            type="number"
            min={0}
            step={1}
            value={sortOrder}
            onChange={(e) => {
              const value =
                Number(e.target.value);

              setSortOrder(
                Number.isNaN(value)
                  ? 0
                  : Math.max(
                      0,
                      Math.floor(value)
                    )
              );
            }}
          />

          {/* BUTTONS */}
          <div className="flex gap-3 pt-3">

            {/* CANCEL */}
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>

            {/* SAVE */}
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="flex-1"
            >
              {editingBanner
                ? "Update Banner"
                : "Save Banner"}
            </Button>

          </div>
        </form>
      </Modal>
    </div>
  );
}