"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { createProductAction, updateProductAction, deleteProductAction } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, Leaf } from "lucide-react";

interface ProductManagerProps {
  products: any[];
  categories: any[];
}

export function ProductManager({ products, categories }: ProductManagerProps) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState<number>(350);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(450);
  const [stock, setStock] = useState<number>(50);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.name.toLowerCase().includes(query.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setShortDescription("");
    setPrice(350);
    setCompareAtPrice(450);
    setStock(50);
    setCategoryId(categories[0]?.id || "");
    setImageUrl("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80");
    setIsFeatured(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setShortDescription(prod.shortDescription || "");
    setPrice(prod.price);
    setCompareAtPrice(prod.compareAtPrice || undefined);
    setStock(prod.stock);
    setCategoryId(prod.categoryId);
    setImageUrl(prod.images?.[0]?.url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80");
    setIsFeatured(prod.isFeatured);
    setIsActive(prod.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (editingProduct) {
      const res = await updateProductAction(editingProduct.id, {
        name,
        description,
        shortDescription: shortDescription || undefined,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        stock: Number(stock),
        categoryId,
        isFeatured,
        isActive,
        images: imageUrl ? [imageUrl] : undefined,
      });
      setIsSubmitting(false);

      if (res.success) {
        toast.success("Product updated successfully!");
        setIsModalOpen(false);
      } else {
        toast.error(res.error || "Failed to update product.");
      }
    } else {
      const res = await createProductAction({
        name,
        description,
        shortDescription: shortDescription || undefined,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        stock: Number(stock),
        categoryId,
        isFeatured,
        isActive,
        images: [imageUrl || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"],
      });
      setIsSubmitting(false);

      if (res.success) {
        toast.success("Product created successfully!");
        setIsModalOpen(false);
      } else {
        toast.error(res.error || "Failed to create product.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const res = await deleteProductAction(id);
      if (res.success) {
        toast.success("Product deleted.");
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    }
  };

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
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-dark"
          />
        </div>

        <Button onClick={openCreateModal} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add New Product
        </Button>
      </div>

      {/* Datatable */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <img
                      src={prod.images?.[0]?.url || "https://via.placeholder.com/60"}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                    />
                  </td>
                  <td className="p-4">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                    {prod.isFeatured && (
                      <span className="text-[10px] text-brand-dark font-bold">Featured Product</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold">{prod.category.name}</td>
                  <td className="p-4 font-extrabold text-slate-900">{formatCurrency(prod.price)}</td>
                  <td className="p-4">
                    <span className={`font-bold ${prod.stock > 10 ? "text-emerald-700" : "text-amber-600"}`}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={prod.isActive ? "success" : "danger"}>
                      {prod.isActive ? "Active" : "Draft"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-dark hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product Details" : "Create New Eco Product"}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Title *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sugandhika Herbal Mosquito Killer Incense Stick"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-dark"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Stock Quantity *"
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (Rs.) *"
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
            <Input
              label="Compare At Price (Rs.)"
              type="number"
              value={compareAtPrice || ""}
              onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 450"
            />
          </div>

          <Input
            label="Main Image URL *"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <Input
            label="Short Description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Chemical-free organic mosquito repellent sticks."
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Full Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-dark"
              placeholder="Detailed organic product benefits..."
            />
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-dark rounded focus:ring-brand-dark"
              />
              Mark as Featured Product
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-brand-dark rounded focus:ring-brand-dark"
              />
              Active on Storefront
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
