import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { categoriesService } from '../../services/api.service.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY_FORM = { name: '', slug: '', description: '' };

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesService.adminGetAll();
      const data = res?.data;
      setCategories(Array.isArray(data) ? data : data?.items ?? data?.categories ?? []);
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    setSlugEdited(false);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name ?? '', slug: cat.slug ?? '', description: cat.description ?? '' });
    setImageFile(null);
    setImagePreview(cat.imageUrl ?? '');
    setImageUrl(cat.imageUrl ?? '');
    setSlugEdited(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !slugEdited) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      let catId = editTarget?.id;
      const payload = { name: form.name, slug: form.slug || slugify(form.name), description: form.description, imageUrl: imageUrl || undefined };
      if (editTarget) {
        await categoriesService.update(editTarget.id, payload);
      } else {
        const res = await categoriesService.create(payload);
        catId = res?.data?.id;
      }
      if (imageFile && catId) {
        const fd = new FormData();
        fd.append('image', imageFile);
        await categoriesService.uploadImage(catId, fd);
      }
      toast.success(editTarget ? 'Category updated!' : 'Category created!');
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await categoriesService.delete(confirmDelete.id);
      toast.success('Category deleted.');
      setConfirmDelete(null);
      fetchCategories();
    } catch {
      toast.error('Failed to delete category.');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-16"><LoadingSpinner /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No categories yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-14">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-right">Products</th>
                  <th className="px-4 py-3 text-right">Order</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{cat._count?.products ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{cat.sortOrder ?? cat.order ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(cat)} className="text-brand hover:text-brand-dark transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(cat)} className="text-red-500 hover:text-red-700 transition" title="Delete">
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Category name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input value={form.slug} onChange={handleSlugChange} className={inputClass} placeholder="auto-generated" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={inputClass} placeholder="Optional description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <ImageUpload preview={imagePreview} onFileSelect={(f, p) => { setImageFile(f); setImagePreview(p || ''); if (f) setImageUrl(''); }} label="Upload category image" />
            <input type="url" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); setImageFile(null); }} placeholder="Or paste image URL (https://...)" className={inputClass + ' mt-3'} />
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

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Category"
        message={`Delete "${confirmDelete?.name}"? Products in this category will be unassigned.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
}
