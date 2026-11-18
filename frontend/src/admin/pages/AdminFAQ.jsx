import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Star, Eye, EyeOff } from 'lucide-react';
import { faqService } from '../../services/api.service.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY_FORM = {
  question: '',
  answer: '',
  category: '',
  isFeatured: false,
  isPublished: true,
};

export default function AdminFAQ() {
  const toast = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await faqService.adminGetAll();
      const data = res?.data;
      setFaqs(Array.isArray(data) ? data : data?.items ?? data?.faqs ?? []);
    } catch {
      toast.error('Failed to load FAQs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (faq) => {
    setEditTarget(faq);
    setForm({
      question: faq.question ?? '',
      answer: faq.answer ?? '',
      category: faq.category ?? '',
      isFeatured: faq.isFeatured ?? false,
      isPublished: faq.isPublished ?? true,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error('Question and answer are required.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await faqService.update(editTarget._id, form);
      } else {
        await faqService.create(form);
      }
      toast.success(editTarget ? 'FAQ updated!' : 'FAQ created!');
      setModalOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await faqService.delete(confirmDelete._id);
      toast.success('FAQ deleted.');
      setConfirmDelete(null);
      fetchFaqs();
    } catch {
      toast.error('Failed to delete FAQ.');
    }
  };

  const handleReorder = async (faq, direction) => {
    const idx = faqs.findIndex((f) => f._id === faq._id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;
    const newFaqs = [...faqs];
    [newFaqs[idx], newFaqs[swapIdx]] = [newFaqs[swapIdx], newFaqs[idx]];
    setFaqs(newFaqs);
    try {
      await faqService.reorder(newFaqs.map((f) => f._id));
    } catch {
      toast.error('Failed to reorder.');
      fetchFaqs();
    }
  };

  const handleToggleFeatured = async (faq) => {
    try {
      await faqService.toggleFeatured(faq._id);
      fetchFaqs();
    } catch { toast.error('Failed.'); }
  };

  const handleTogglePublish = async (faq) => {
    try {
      await faqService.togglePublish(faq._id);
      fetchFaqs();
    } catch { toast.error('Failed.'); }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-16"><LoadingSpinner /></div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No FAQs yet.</div>
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
                {faqs.map((faq, idx) => (
                  <tr key={faq._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="truncate font-medium text-gray-900">{faq.question}</div>
                      <div className="truncate text-xs text-gray-400 mt-0.5">{faq.answer}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{faq.category || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleFeatured(faq)} className={`transition ${faq.isFeatured ? 'text-brand-gold' : 'text-gray-300'} hover:text-brand-gold`}>
                        <Star className="w-4 h-4" fill={faq.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleTogglePublish(faq)} className={`transition ${faq.isPublished ? 'text-brand' : 'text-gray-400'} hover:text-brand-dark`}>
                        {faq.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleReorder(faq, 'up')} disabled={idx === 0} className="p-0.5 hover:text-brand disabled:opacity-30">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReorder(faq, 'down')} disabled={idx === faqs.length - 1} className="p-0.5 hover:text-brand disabled:opacity-30">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(faq)} className="text-brand hover:text-brand-dark" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(faq)} className="text-red-500 hover:text-red-700" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit FAQ' : 'Add FAQ'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question <span className="text-red-500">*</span></label>
            <input name="question" value={form.question} onChange={handleChange} className={inputClass} placeholder="Enter question" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer <span className="text-red-500">*</span></label>
            <textarea name="answer" value={form.answer} onChange={handleChange} rows={5} className={inputClass} placeholder="Enter answer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className={inputClass} placeholder="e.g. General, Products" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-brand" />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} className="w-4 h-4 accent-brand" />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition disabled:opacity-60 flex items-center gap-2">
              {saving && <LoadingSpinner size="sm" />}
              {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete FAQ"
        message={`Delete this FAQ: "${confirmDelete?.question?.substring(0, 60)}…"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
}
