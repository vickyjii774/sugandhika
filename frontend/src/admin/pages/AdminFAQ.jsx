
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';

import {
  faqService,
  faqCategoriesService,
} from '../../services/api.service.js';

import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY_FORM = {
  question: '',
  answer: '',
  categoryId: '',
  isFeatured: false,
  isPublished: true,
};

// Supports the Prisma id format and legacy records.
const getFaqId = (faq) => faq?.id ?? faq?._id;

const extractList = (response, keys = []) => {
  const payload = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
};

export default function AdminFAQ() {
  const toast = useToast();

  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load FAQs
  const fetchFaqs = useCallback(async () => {
    setLoading(true);

    try {
      const response = await faqService.adminGetAll();

      const data = extractList(response, ['items', 'faqs']);

      setFaqs(data);
    } catch (error) {
      console.error('FAQ loading error:', error);
      toast.error('Failed to load FAQs.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load FAQ categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await faqCategoriesService.getAll();

      const data = extractList(response, ['items', 'categories']);

      setCategories(data);
    } catch (error) {
      console.error('FAQ categories loading error:', error);
      toast.error('Failed to load FAQ categories.');
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
    fetchCategories();
  }, [fetchFaqs, fetchCategories]);

  // Add FAQ
  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  // Edit FAQ
  const openEdit = (faq) => {
    setEditTarget(faq);

    setForm({
      question: faq.question ?? '',
      answer: faq.answer ?? '',
      categoryId: faq.categoryId ?? faq.category?.id ?? '',
      isFeatured: faq.isFeatured ?? false,
      isPublished: faq.isPublished ?? true,
    });

    setModalOpen(true);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save FAQ
  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        categoryId: form.categoryId || null,
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
      };

      const id = getFaqId(editTarget);

      if (editTarget && id) {
        await faqService.update(id, payload);
      } else {
        await faqService.create(payload);
      }

      toast.success(editTarget ? 'FAQ updated!' : 'FAQ created!');

      setModalOpen(false);
      setEditTarget(null);
      setForm({ ...EMPTY_FORM });

      await fetchFaqs();
    } catch (error) {
      console.error('FAQ save error:', error);

      toast.error(
        error?.response?.data?.message ?? 'Failed to save FAQ.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete FAQ
  const handleDelete = async () => {
    if (!confirmDelete) return;

    const id = getFaqId(confirmDelete);

    if (!id) {
      toast.error('Invalid FAQ ID.');
      return;
    }

    try {
      await faqService.delete(id);

      toast.success('FAQ deleted.');
      setConfirmDelete(null);

      await fetchFaqs();
    } catch (error) {
      console.error('FAQ delete error:', error);
      toast.error('Failed to delete FAQ.');
    }
  };

  // Reorder FAQs
  const handleReorder = async (faq, direction) => {
    const id = getFaqId(faq);

    const idx = faqs.findIndex(
      (item) => getFaqId(item) === id
    );

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (idx < 0 || swapIdx < 0 || swapIdx >= faqs.length) {
      return;
    }

    const newFaqs = [...faqs];

    [newFaqs[idx], newFaqs[swapIdx]] = [
      newFaqs[swapIdx],
      newFaqs[idx],
    ];

    setFaqs(newFaqs);

    try {
      const items = newFaqs.map((item, index) => ({
        id: getFaqId(item),
        sortOrder: index,
      }));

      await faqService.reorder({ items });

      toast.success('FAQ order updated.');
    } catch (error) {
      console.error('FAQ reorder error:', error);
      toast.error('Failed to reorder FAQs.');

      await fetchFaqs();
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (faq) => {
    const id = getFaqId(faq);

    try {
      await faqService.toggleFeatured(id);
      await fetchFaqs();
    } catch (error) {
      console.error('FAQ featured error:', error);
      toast.error('Failed to update featured status.');
    }
  };

  // Toggle published
  const handleTogglePublish = async (faq) => {
    const id = getFaqId(faq);

    try {
      await faqService.togglePublish(id);
      await fetchFaqs();
    } catch (error) {
      console.error('FAQ publish error:', error);
      toast.error('Failed to update publishing status.');
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          FAQs
        </h1>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* FAQ Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No FAQs yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Question</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Published</th>
                  <th className="px-4 py-3 text-center">Order</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {faqs.map((faq, idx) => {
                  const categoryName =
                    typeof faq.category === 'object'
                      ? faq.category?.name
                      : faq.category;

                  return (
                    <tr
                      key={getFaqId(faq) ?? `faq-${idx}`}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className="truncate font-medium text-gray-900">
                          {faq.question}
                        </div>

                        <div className="truncate text-xs text-gray-400 mt-0.5">
                          {faq.answer}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {categoryName || '—'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(faq)}
                          className={`transition ${
                            faq.isFeatured
                              ? 'text-brand-gold'
                              : 'text-gray-300'
                          } hover:text-brand-gold`}
                          title="Toggle featured"
                        >
                          <Star
                            className="w-4 h-4"
                            fill={
                              faq.isFeatured
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTogglePublish(faq)}
                          className={`transition ${
                            faq.isPublished
                              ? 'text-brand'
                              : 'text-gray-400'
                          } hover:text-brand-dark`}
                          title="Toggle publishing"
                        >
                          {faq.isPublished ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleReorder(faq, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 hover:text-brand disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleReorder(faq, 'down')}
                            disabled={idx === faqs.length - 1}
                            className="p-0.5 hover:text-brand disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(faq)}
                            className="text-brand hover:text-brand-dark"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setConfirmDelete(faq)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit FAQ' : 'Add FAQ'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question <span className="text-red-500">*</span>
            </label>

            <input
              name="question"
              value={form.question}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter question"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer <span className="text-red-500">*</span>
            </label>

            <textarea
              name="answer"
              value={form.answer}
              onChange={handleChange}
              rows={5}
              className={inputClass}
              placeholder="Enter answer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>

            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">No category</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {categories.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No FAQ categories available. You can still create an FAQ without a category.
              </p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-brand"
              />

              <span className="text-sm font-medium text-gray-700">
                Featured
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
                className="w-4 h-4 accent-brand"
              />

              <span className="text-sm font-medium text-gray-700">
                Published
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <LoadingSpinner size="sm" />}

              {saving
                ? 'Saving...'
                : editTarget
                  ? 'Update'
                  : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete FAQ"
        message={`Delete this FAQ: "${confirmDelete?.question?.substring(0, 60) ?? ''}..."?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
}
