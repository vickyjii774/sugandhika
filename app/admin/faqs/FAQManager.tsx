"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import {
  createFAQAction,
  updateFAQAction,
  deleteFAQAction,
} from "./actions";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface FAQManagerProps {
  faqs: FAQ[];
}

export default function FAQManager({
  faqs,
}: FAQManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingFAQ, setDeletingFAQ] = useState<FAQ | null>(null);

  const openCreateModal = () => {
    setEditingFAQ(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsModalOpen(true);
  };

  const openDeleteModal = (faq: FAQ) => {
    setDeletingFAQ(faq);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFAQ(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingFAQ(null);
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            FAQs Management
          </h1>

          <p className="text-xs text-slate-500">
            Frequently Asked Questions shown on store & home page
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add FAQ
        </Button>
      </div>

      {/* FAQ LIST */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-100 shadow-soft text-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <HelpCircle size={40} />

              <p className="text-sm">
                No FAQs found.
              </p>

              <Button
                type="button"
                onClick={openCreateModal}
              >
                <Plus size={16} className="mr-2" />
                Add First FAQ
              </Button>
            </div>
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft"
            >
              <div className="flex items-start justify-between gap-6">
                {/* CONTENT */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-50 text-green-700 text-xs font-bold">
                      {faq.sortOrder}
                    </span>

                    <h4 className="font-bold text-sm text-slate-900">
                      {faq.question}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-10">
                    {faq.answer}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    title="Edit FAQ"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openDeleteModal(faq)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    title="Delete FAQ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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
                {editingFAQ ? "Edit FAQ" : "Add FAQ"}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {editingFAQ
                  ? "Update frequently asked question"
                  : "Create a new frequently asked question"}
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
                if (editingFAQ) {
                  formData.set("id", editingFAQ.id);

                  await updateFAQAction(formData);
                } else {
                  await createFAQAction(formData);
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
            {/* QUESTION */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Question
              </label>

              <input
                type="text"
                name="question"
                defaultValue={editingFAQ?.question || ""}
                required
                placeholder="e.g. How long does delivery take?"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
              />
            </div>

            {/* ANSWER */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Answer
              </label>

              <textarea
                name="answer"
                defaultValue={editingFAQ?.answer || ""}
                required
                rows={6}
                placeholder="Write the answer..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-green-500"
              />
            </div>

            {/* SORT ORDER */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Sort Order
              </label>

              <input
                type="number"
                name="sortOrder"
                min="0"
                step="1"
                defaultValue={editingFAQ?.sortOrder ?? 0}
                required
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "+"
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
              />

              <p className="text-[11px] text-slate-400 mt-1">
                Lower numbers appear first.
              </p>
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
                {editingFAQ ? "Update FAQ" : "Create FAQ"}
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
              Delete FAQ
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
            Are you sure you want to delete this FAQ?
            This action cannot be undone.
          </p>

          {deletingFAQ && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="font-bold text-slate-900">
                {deletingFAQ.question}
              </p>

              <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                {deletingFAQ.answer}
              </p>
            </div>
          )}

          <form
            action={async (formData) => {
              try {
                if (!deletingFAQ) return;

                formData.set("id", deletingFAQ.id);

                await deleteFAQAction(formData);

                closeDeleteModal();
              } catch (error) {
                alert(
                  error instanceof Error
                    ? error.message
                    : "Failed to delete FAQ."
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
                Delete FAQ
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}