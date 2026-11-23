import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Star, Eye, EyeOff } from 'lucide-react';
import { teamService } from '../../services/api.service.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY_FORM = {
  name: '',
  designation: '',
  bio: '',
  email: '',
  phone: '',
  sortOrder: '',
  isFeatured: false,
  isPublished: true,
};

export default function AdminTeam() {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teamService.adminGetAll();
      const data = res?.data;
      setMembers(Array.isArray(data) ? data : data?.items ?? data?.members ?? []);
    } catch {
      toast.error('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, sortOrder: members.length + 1 });
    setPhotoFile(null);
    setPhotoPreview('');
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditTarget(member);
    setForm({
      name: member.name ?? '',
      designation: member.designation ?? '',
      bio: member.bio ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      sortOrder: member.sortOrder ?? member.order ?? '',
      isFeatured: member.isFeatured ?? false,
      isPublished: member.isPublished ?? true,
    });
    setPhotoFile(null);
    setPhotoPreview(member.imageUrl ?? '');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      let memberId = editTarget?.id;
      const payload = {
        name: form.name,
        designation: form.designation,
        bio: form.bio,
        email: form.email,
        phone: form.phone,
        sortOrder: form.sortOrder !== '' ? Number(form.sortOrder) : undefined,
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
      };
      if (editTarget) {
        await teamService.update(editTarget.id, payload);
      } else {
        const res = await teamService.create(payload);
        memberId = res?.data?.id;
      }
      if (photoFile && memberId) {
        const fd = new FormData();
        fd.append('image', photoFile);
        await teamService.uploadPhoto(memberId, fd);
      }
      toast.success(editTarget ? 'Member updated!' : 'Member added!');
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await teamService.delete(confirmDelete.id);
      toast.success('Member deleted.');
      setConfirmDelete(null);
      fetchMembers();
    } catch {
      toast.error('Failed to delete member.');
    }
  };

  const handleReorder = async (member, direction) => {
    const idx = members.findIndex((m) => m.id === member._id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= members.length) return;
    const newMembers = [...members];
    [newMembers[idx], newMembers[swapIdx]] = [newMembers[swapIdx], newMembers[idx]];
    setMembers(newMembers);
    try {
      const ids = newMembers.map((m) => m._id);
      await teamService.reorder(ids);
    } catch {
      toast.error('Failed to reorder.');
      fetchMembers();
    }
  };

  const handleToggleFeatured = async (member) => {
    try {
      await teamService.toggleFeatured(member._id);
      fetchMembers();
    } catch { toast.error('Failed to update.'); }
  };

  const handleTogglePublish = async (member) => {
    try {
      await teamService.togglePublish(member._id);
      fetchMembers();
    } catch { toast.error('Failed to update.'); }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-16"><LoadingSpinner /></div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No team members yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-14">Photo</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Published</th>
                  <th className="px-4 py-3 text-center">Order</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {m.imageUrl ? (
                        <img src={m.photo} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-semibold border border-gray-200">
                          {m.name?.charAt(0) ?? '?'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.designation}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleFeatured(m)} className={`transition ${m.isFeatured ? 'text-brand-gold' : 'text-gray-300'} hover:text-brand-gold`} title="Toggle featured">
                        <Star className="w-4 h-4" fill={m.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleTogglePublish(m)} className={`transition ${m.isPublished ? 'text-brand' : 'text-gray-400'} hover:text-brand-dark`} title="Toggle publish">
                        {m.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleReorder(m, 'up')} disabled={idx === 0} className="p-0.5 hover:text-brand disabled:opacity-30 transition">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReorder(m, 'down')} disabled={idx === members.length - 1} className="p-0.5 hover:text-brand disabled:opacity-30 transition">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(m)} className="text-brand hover:text-brand-dark transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(m)} className="text-red-500 hover:text-red-700 transition" title="Delete">
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Team Member' : 'Add Team Member'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input name="designation" value={form.designation} onChange={handleChange} className={inputClass} placeholder="e.g. Co-founder" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className={inputClass} placeholder="Short biography" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="Email address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Phone number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} className={inputClass} placeholder="1" />
          </div>
          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-brand" />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} className="w-4 h-4 accent-brand" />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
            <ImageUpload preview={photoPreview} onFileSelect={(f, p) => { setPhotoFile(f); setPhotoPreview(p); }} label="Upload photo" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition disabled:opacity-60 flex items-center gap-2">
            {saving && <LoadingSpinner size="sm" />}
            {saving ? 'Saving…' : editTarget ? 'Update' : 'Add Member'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Team Member"
        message={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
}
