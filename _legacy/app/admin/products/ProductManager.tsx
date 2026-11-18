"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface ProductManagerProps {
  products: any[];
  categories: any[];
}

export function ProductManager({
  products,
  categories,
}: ProductManagerProps) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState<number>(350);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(
    450
  );
  const [stock, setStock] = useState<number>(50);
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id || ""
  );

  // Image State
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(query.toLowerCase())
  );

  // --------------------------------------------------
  // Reset Form
  // --------------------------------------------------

  const resetForm = () => {
    setEditingProduct(null);

    setName("");
    setDescription("");
    setShortDescription("");

    setPrice(350);
    setCompareAtPrice(450);
    setStock(50);

    setCategoryId(categories[0]?.id || "");

    setImageUrl("");
    setImageFile(null);
    setImagePreview("");

    setIsFeatured(false);
    setIsActive(true);

    setIsUploadingImage(false);
    setIsSubmitting(false);
  };

  // --------------------------------------------------
  // Open Create Modal
  // --------------------------------------------------

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);

    setName(prod.name || "");
    setDescription(prod.description || "");
    setShortDescription(prod.shortDescription || "");

    setPrice(Math.max(0, Number(prod.price) || 0));

    setCompareAtPrice(
      prod.compareAtPrice !== null &&
        prod.compareAtPrice !== undefined
        ? Math.max(0, Number(prod.compareAtPrice))
        : undefined
    );

    setStock(Math.max(0, Number(prod.stock) || 0));

    setCategoryId(prod.categoryId || categories[0]?.id || "");

    const existingImage = prod.images?.[0]?.url || "";

    setImageUrl(existingImage);
    setImageFile(null);
    setImagePreview(existingImage);

    setIsFeatured(Boolean(prod.isFeatured));
    setIsActive(Boolean(prod.isActive));

    setIsModalOpen(true);
  };

  // --------------------------------------------------
  // Handle Image Selection
  // --------------------------------------------------

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // --------------------------------------------------
  // Remove Selected Image
  // --------------------------------------------------

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
  };

  // --------------------------------------------------
  // Upload Image to Cloudinary
  // --------------------------------------------------

  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string> => {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary environment variables are not configured."
      );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image.");
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    return data.secure_url;
  };

  // --------------------------------------------------
  // Submit Form
  // --------------------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (price < 0) {
      toast.error("Price cannot be negative.");
      return;
    }

    if (stock < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    if (
      compareAtPrice !== undefined &&
      compareAtPrice < 0
    ) {
      toast.error("Compare-at price cannot be negative.");
      return;
    }

    setIsSubmitting(true);

    let finalImageUrl = imageUrl;

    try {
      // Upload new image if selected
      if (imageFile) {
        setIsUploadingImage(true);

        finalImageUrl =
          await uploadImageToCloudinary(imageFile);

        setImageUrl(finalImageUrl);

        setIsUploadingImage(false);
      }

      // --------------------------------------------------
      // Update Product
      // --------------------------------------------------

      if (editingProduct) {
        const res = await updateProductAction(
          editingProduct.id,
          {
            name: name.trim(),

            description: description.trim(),

            shortDescription:
              shortDescription.trim() || undefined,

            price: Math.max(0, Number(price)),

            compareAtPrice:
              compareAtPrice !== undefined
                ? Math.max(0, Number(compareAtPrice))
                : null,

            stock: Math.max(0, Number(stock)),

            categoryId,

            isFeatured,

            isActive,

            images: finalImageUrl
              ? [finalImageUrl]
              : undefined,
          }
        );

        setIsSubmitting(false);

        if (res.success) {
          toast.success(
            "Product updated successfully!"
          );

          setIsModalOpen(false);
          resetForm();
        } else {
          toast.error(
            res.error ||
              "Failed to update product."
          );
        }

        return;
      }

      // --------------------------------------------------
      // Create Product
      // --------------------------------------------------

      if (!finalImageUrl) {
        toast.error("Please select a product image.");
        setIsSubmitting(false);
        return;
      }

      const res = await createProductAction({
        name: name.trim(),

        description: description.trim(),

        shortDescription:
          shortDescription.trim() || undefined,

        price: Math.max(0, Number(price)),

        compareAtPrice:
          compareAtPrice !== undefined
            ? Math.max(0, Number(compareAtPrice))
            : null,

        stock: Math.max(0, Number(stock)),

        categoryId,

        isFeatured,

        isActive,

        images: [finalImageUrl],
      });

      setIsSubmitting(false);

      if (res.success) {
        toast.success(
          "Product created successfully!"
        );

        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(
          res.error ||
            "Failed to create product."
        );
      }
    } catch (error) {
      console.error(error);

      setIsUploadingImage(false);
      setIsSubmitting(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  // --------------------------------------------------
  // Delete Product
  // --------------------------------------------------

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      return;
    }

    try {
      const res = await deleteProductAction(id);

      if (res.success) {
        toast.success("Product deleted.");
      } else {
        toast.error(
          res.error || "Failed to delete."
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong while deleting the product."
      );
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Search Bar & Action Trigger */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-dark"
          />
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New Product
        </Button>
      </div>

      {/* Data Table */}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">
                  Image
                </th>

                <th className="p-4">
                  Product Name
                </th>

                <th className="p-4">
                  Category
                </th>

                <th className="p-4">
                  Price
                </th>

                <th className="p-4">
                  Stock
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredProducts.map(
                (prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Image */}

                    <td className="p-4">
                      <img
                        src={
                          prod.images?.[0]?.url ||
                          "https://via.placeholder.com/60"
                        }
                        alt={prod.name || "Product"}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                      />
                    </td>

                    {/* Product Name */}

                    <td className="p-4">
                      <h4 className="font-bold text-slate-900 line-clamp-1">
                        {prod.name}
                      </h4>

                      {prod.isFeatured && (
                        <span className="text-[10px] text-brand-dark font-bold">
                          Featured Product
                        </span>
                      )}
                    </td>

                    {/* Category */}

                    <td className="p-4 font-semibold">
                      {prod.category?.name ||
                        "Uncategorized"}
                    </td>

                    {/* Price */}

                    <td className="p-4 font-extrabold text-slate-900">
                      {formatCurrency(
                        prod.price
                      )}
                    </td>

                    {/* Stock */}

                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          prod.stock > 10
                            ? "text-emerald-700"
                            : "text-amber-600"
                        }`}
                      >
                        {Math.max(
                          0,
                          prod.stock
                        )}{" "}
                        units
                      </span>
                    </td>

                    {/* Status */}

                    <td className="p-4">
                      <Badge
                        variant={
                          prod.isActive
                            ? "success"
                            : "danger"
                        }
                      >
                        {prod.isActive
                          ? "Active"
                          : "Draft"}
                      </Badge>
                    </td>

                    {/* Actions */}

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(prod)
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-dark hover:bg-slate-100 transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              prod.id
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center text-slate-400"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
          }
        }}
        title={
          editingProduct
            ? "Edit Product Details"
            : "Create New Eco Product"
        }
        maxWidth="xl"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Product Name */}

          <Input
            label="Product Title *"
            required
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Sugandhika Herbal Mosquito Killer Incense Stick"
          />

          {/* Category + Stock */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Category *
              </label>

              <select
                required
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value
                  )
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-dark"
              >
                <option value="">
                  Select category
                </option>

                {categories.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Stock Quantity *"
              type="number"
              required
              min={0}
              step={1}
              value={stock}
              onChange={(e) => {
                const value =
                  e.target.value === ""
                    ? 0
                    : Number(
                        e.target.value
                      );

                setStock(
                  Math.max(0, value)
                );
              }}
            />
          </div>

          {/* Price + Compare Price */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (Rs.) *"
              type="number"
              required
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => {
                const value =
                  e.target.value === ""
                    ? 0
                    : Number(
                        e.target.value
                      );

                setPrice(
                  Math.max(0, value)
                );
              }}
            />

            <Input
              label="Compare At Price (Rs.)"
              type="number"
              min={0}
              step="0.01"
              value={
                compareAtPrice ??
                ""
              }
              onChange={(e) => {
                if (
                  e.target.value === ""
                ) {
                  setCompareAtPrice(
                    undefined
                  );
                  return;
                }

                const value =
                  Number(
                    e.target.value
                  );

                setCompareAtPrice(
                  Math.max(0, value)
                );
              }}
              placeholder="e.g. 450"
            />
          </div>

          {/* Product Image */}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Product Image *
            </label>

            <div className="relative">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                required={
                  !editingProduct &&
                  !imageUrl &&
                  !imageFile
                }
                onChange={
                  handleImageChange
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm
                  file:mr-4
                  file:rounded-lg
                  file:border-0
                  file:bg-brand-dark
                  file:px-4
                  file:py-2
                  file:text-sm
                  file:font-semibold
                  file:text-white
                  hover:file:opacity-90
                  cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              JPG, PNG or WEBP. Maximum
              file size: 5MB.
            </p>

            {/* Image Preview */}

            {imagePreview && (
              <div className="relative w-fit mt-3">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-28 h-28 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />

                <button
                  type="button"
                  onClick={
                    handleRemoveImage
                  }
                  disabled={
                    isSubmitting
                  }
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 disabled:opacity-50"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!imagePreview && (
              <div className="flex items-center justify-center w-full h-28 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                <div className="text-center">
                  <ImageIcon className="w-7 h-7 mx-auto text-slate-300" />

                  <p className="text-xs text-slate-400 mt-1">
                    No image selected
                  </p>
                </div>
              </div>
            )}

            {imageFile && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Upload className="w-3.5 h-3.5" />

                <span className="truncate">
                  {imageFile.name}
                </span>
              </div>
            )}
          </div>

          {/* Short Description */}

          <Input
            label="Short Description"
            value={shortDescription}
            onChange={(e) =>
              setShortDescription(
                e.target.value
              )
            }
            placeholder="Chemical-free organic mosquito repellent sticks."
          />

          {/* Full Description */}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Full Description *
            </label>

            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-dark resize-none"
              placeholder="Detailed organic product benefits..."
            />
          </div>

          {/* Options */}

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) =>
                  setIsFeatured(
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-brand-dark rounded focus:ring-brand-dark"
              />

              Mark as Featured Product
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-brand-dark rounded focus:ring-brand-dark"
              />

              Active on Storefront
            </label>
          </div>

          {/* Buttons */}

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() =>
                setIsModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={
                isSubmitting ||
                isUploadingImage
              }
            >
              {isUploadingImage
                ? "Uploading Image..."
                : editingProduct
                ? "Save Changes"
                : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}