"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createCategoryAction, deleteCategoryAction } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { Plus, Trash2, Layers } from "lucide-react";

export function CategoryManager({ categories }: { categories: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createCategoryAction({ name, description, image, sortOrder });
    setSubmitting(false);

    if (res.success) {
      toast.success("Category created successfully!");
      setName("");
      setDescription("");
      setImage("");
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "Failed to create category.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this category?")) {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        toast.success("Category deleted.");
      } else {
        toast.error(res.error || "Failed to delete category.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col justify-between">
            <div className="relative h-40 bg-slate-50">
              <img src={cat.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"} alt="" className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm">
                {cat._count.products} Products
              </span>
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
            </div>
            <div className="p-4 pt-0 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Category Name *" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mosquito Killer Stick" />
          <Input label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/..." />
          <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 text-sm border border-slate-200 rounded-xl" />
          </div>
          <Button type="submit" variant="primary" isLoading={submitting} className="w-full">
            Save Category
          </Button>
        </form>
      </Modal>
    </div>
  );
}
