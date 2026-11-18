import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import useToast from '../../hooks/useToast.js';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

// Features (Why Choose Us) are stored in homepage sections or a custom endpoint.
// We call /admin/homepage and work with the features section data.
// Fallback: manage locally using homepageService.updateSection('features', data)
import { homepageService } from '../../services/api.service.js';

const ICON_OPTIONS = ['Leaf', 'Shield', 'Heart', 'Star', 'Award', 'Sparkles', 'CheckCircle', 'ThumbsUp', 'Package', 'Zap'];
const EMPTY_FORM = { icon: 'Leaf', title: '', description: '', sortOrder: 1, isPublished: true };

export default function AdminFeatures() {
  const toast = useToast();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const load = () => {
    setLoading(true);
    homepageService.getAll()
      .then(res => {
        const data = res.data;
        const f = data?.features?.items || data?.features || [];
        setFeatures(Array.isArray(f) ? f : []);
      })
      .catch(() => toast.error('Failed to load features.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveFeatures = async (updatedFeatures) => {
    try {
      await homepageService.updateSection('features', { items: updatedFeatures });
    } catch {
      toast.error('Failed to save features.');
      load();
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: features.length + 1 });
    setModal(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({ icon: f.icon || 'Leaf', title: f.title || '', description: f.description || '', sortOrder: f.sortOrder || 1, isPublished: f.isPublished !== false });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      let updated;
      if (editing) {
        updated = features.map(f => f.id === editing.id ? { ...f, ...form } : f);
      } else {
        const newItem = { id: Date.now().toString(), ...form };
        updated = [...features, newItem];
      }
      await saveFeatures(updated);
      setFeatures(updated);
      toast.success('Feature saved!');
      setModal(false);
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    const updated = features.filter(f => f.id !== confirmId);
    await saveFeatures(updated);
    setFeatures(updated);
    toast.success('Deleted!');
    setConfirmId(null);
  };

  const togglePublish = async (feature) => {
    const updated = features.map(f => f.id === feature.id ? { ...f, isPublished: !f.isPublished } : f);
    await saveFeatures(updated);
    setFeatures(updated);
  };

  const move = async (index, dir) => {
    const arr = [...features];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    const updated = arr.map((f, i) => ({ ...f, sortOrder: i + 1 }));
    setFeatures(updated);
    await saveFeatures(updated);
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Why Choose Us Features</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the feature cards shown on the homepage.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Feature
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : features.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No features yet. Add some above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-gray-600 font-medium w-16">Order</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Icon</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Title</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Description</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Status</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((feature, i) => (
                <tr key={feature.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex gap-0.5">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === features.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-gray-600 bg-gray-50">{feature.icon}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{feature.title}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{feature.description}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => togglePublish(feature)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${feature.isPublished !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {feature.isPublished !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {feature.isPublished !== false ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(feature)} className="p-1.5 text-brand hover:text-brand-dark rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmId(feature.id)} className="p-1.5 text-red-500 hover:text-red-700 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Feature' : 'Add Feature'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={labelClass}>Icon Name (Lucide) <span className="text-red-500">*</span></label>
            <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inputClass}>
              {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} placeholder="100% Natural" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${inputClass} resize-none`} placeholder="Made from pure plant extracts…" />
          </div>
          <div>
            <label className={labelClass}>Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 1 }))} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-brand" />
            <span className="text-sm text-gray-700">Published (visible on homepage)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
              {saving && <LoadingSpinner size="xs" />}{saving ? 'Saving…' : 'Save Feature'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete}
        title="Delete Feature" message="Are you sure you want to delete this feature card?" />
    </div>
  );
}
