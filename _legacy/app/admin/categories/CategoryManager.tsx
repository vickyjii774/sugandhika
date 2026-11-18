"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload, X } from "lucide-react";

export function CategoryManager({
  categories,
}: {
  categories: any[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [sortOrder, setSortOrder] = useState<number | "">(0);

  const [submitting, setSubmitting] = useState(false);

  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage("");
    setImageFile(null);
    setImagePreview("");
    setSortOrder(0);
    setEditingCategory(null);
  };

  // =====================================================
  // ADD CATEGORY
  // =====================================================

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // =====================================================
  // EDIT CATEGORY
  // =====================================================

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);

    setName(cat.name || "");
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setImageFile(null);
    setImagePreview(cat.image || "");
    setSortOrder(cat.sortOrder ?? 0);

    setIsModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    resetForm();
  };

  // =====================================================
  // IMAGE FILE SELECT
  // =====================================================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    // File and URL cannot both be used
    setImageFile(file);
    setImage("");

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // =====================================================
  // IMAGE URL CHANGE
  // =====================================================

  const handleImageUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setImage(value);

    // If URL is entered, remove uploaded file
    if (value.trim()) {
      setImageFile(null);
      setImagePreview(value);
    } else if (!imageFile) {
      setImagePreview("");
    }
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    setImage("");
    setImageFile(null);
    setImagePreview("");
  };

  // =====================================================
  // UPLOAD IMAGE TO CLOUDINARY
  // =====================================================

  const uploadImage = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image.");
    }

    const data = await response.json();

    if (!data.url) {
      throw new Error("Image upload failed.");
    }

    return data.url;
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Name validation
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    // Sort order validation
    if (sortOrder === "" || sortOrder < 0) {
      toast.error("Sort Order must be 0 or greater.");
      return;
    }

    // Image validation
    if (!imageFile && !image.trim() && !editingCategory?.image) {
      toast.error("Please upload an image or provide an image URL.");
      return;
    }

    setSubmitting(true);

    try {
      let finalImage = image.trim();

      // =================================================
      // UPLOAD FILE IF SELECTED
      // =================================================

      if (imageFile) {
        toast.loading("Uploading image...", {
          id: "category-upload",
        });

        finalImage = await uploadImage(imageFile);

        toast.success("Image uploaded.", {
          id: "category-upload",
        });
      }

      // =================================================
      // UPDATE
      // =================================================

      let res;

      if (editingCategory) {
        res = await updateCategoryAction(
          editingCategory.id,
          {
            name: name.trim(),
            description: description.trim(),
            image: finalImage,
            sortOrder: Number(sortOrder),
          }
        );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        res = await createCategoryAction({
          name: name.trim(),
          description: description.trim(),
          image: finalImage,
          sortOrder: Number(sortOrder),
        });
      }

      // =================================================
      // SUCCESS
      // =================================================

      if (res.success) {
        toast.success(
          editingCategory
            ? "Category updated successfully!"
            : "Category created successfully!"
        );

        setIsModalOpen(false);
        resetForm();

        window.location.reload();
      } else {
        toast.error(
          res.error ||
            (editingCategory
              ? "Failed to update category."
              : "Failed to create category.")
        );
      }
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message || "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) {
      return;
    }

    try {
      const res = await deleteCategoryAction(id);

      if (res.success) {
        toast.success("Category deleted.");
        window.location.reload();
      } else {
        toast.error(
          res.error || "Failed to delete category."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* ADD BUTTON */}
      <div className="flex justify-end">
        <Button
          onClick={handleAdd}
          variant="primary"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New Category
        </Button>
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col justify-between"
          >

            {/* IMAGE */}
            <div className="relative h-40 bg-slate-50">

              <img
                src={
                  cat.image ||
                  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"
                }
                alt={cat.name || "Category"}
                className="w-full h-full object-cover"
              />

              {/* PRODUCT COUNT */}
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm">
                {cat._count?.products || 0} Products
              </span>
            </div>

            {/* CATEGORY INFO */}
            <div className="p-4 space-y-2">

              <h4 className="font-bold text-slate-900 text-sm">
                {cat.name}
              </h4>

              <p className="text-xs text-slate-500 line-clamp-2">
                {cat.description ||
                  "No description available."}
              </p>

              <p className="text-[11px] text-slate-400">
                Sort Order: {cat.sortOrder ?? 0}
              </p>

            </div>

            {/* ACTIONS */}
            <div className="p-4 pt-0 border-t border-slate-100 flex justify-end gap-2">

              {/* EDIT ICON */}
              <button
                type="button"
                onClick={() => handleEdit(cat)}
                title="Edit category"
                className="p-1.5 text-slate-400 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {/* DELETE ICON */}
              <button
                type="button"
                onClick={() =>
                  handleDelete(cat.id)
                }
                title="Delete category"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

            </div>
          </div>
        ))}

      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingCategory
            ? "Edit Category"
            : "Create New Category"
        }
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* CATEGORY NAME */}
          <Input
            label="Category Name *"
            required
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="e.g. Mosquito Killer Stick"
          />

          {/* IMAGE SECTION */}
          <div className="space-y-3">

            <label className="block text-sm font-medium text-slate-700">
              Category Image *
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* FILE UPLOAD */}
              <div className="space-y-1.5">

                <label className="block text-xs font-medium text-slate-500">
                  Upload Image
                </label>

                <label className="flex items-center justify-center gap-2 w-full h-11 px-4 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">

                  <Upload className="w-4 h-4 text-slate-500" />

                  <span className="text-sm text-slate-600">
                    Choose Image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                </label>

                {imageFile && (
                  <p className="text-xs text-green-600 truncate">
                    {imageFile.name}
                  </p>
                )}

              </div>

              {/* URL */}
              <div className="space-y-1.5">

                <label className="block text-xs font-medium text-slate-500">
                  Or Image URL
                </label>

                <Input
                  value={image}
                  onChange={handleImageUrlChange}
                  placeholder="https://..."
                />

              </div>

            </div>

            <p className="text-xs text-slate-400">
              Use either an uploaded image or an image URL.
            </p>

            {/* IMAGE PREVIEW */}
            {imagePreview && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">

                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm text-slate-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>
            )}

          </div>

          {/* SORT ORDER */}
          <Input
            label="Sort Order *"
            type="number"
            min={0}
            step={1}
            required
            value={sortOrder}
            onChange={(e) => {

              const value = e.target.value;

              if (value === "") {
                setSortOrder("");
                return;
              }

              const numberValue = Number(value);

              if (Number.isNaN(numberValue)) {
                return;
              }

              setSortOrder(
                Math.max(
                  0,
                  Math.floor(numberValue)
                )
              );
            }}
          />

          {/* DESCRIPTION */}
          <div className="space-y-1.5">

            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="Enter category description..."
            />

          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            className="w-full"
          >
            {editingCategory
              ? "Update Category"
              : "Save Category"}
          </Button>

        </form>
      </Modal>
    </div>
  );
}