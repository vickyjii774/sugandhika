import { useState, useEffect } from 'react';
import { navigationService } from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import useToast from '../../hooks/useToast.js';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

const EMPTY_FORM = { label: '', url: '/', sortOrder: 1, isVisible: true };

export default function AdminNavigation() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = () => {
    setLoading(true);
    navigationService.getAdmin()
      .then(res => setItems(res.data?.items || res.data || []))
      .catch(() => toast.error('Failed to load navigation.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: items.length + 1 });
    setModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ label: item.label, url: item.url, sortOrder: item.sortOrder, isVisible: item.isVisible });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.label || !form.url) { toast.error('Label and URL are required.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await navigationService.update(editing.id, form);
        toast.success('Navigation item updated!');
      } else {
        await navigationService.create(form);
        toast.success('Navigation item added!');
      }
      setModal(false);
      load();
    } catch {
      toast.error('Failed to save navigation item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(confirmId);
    try {
      await navigationService.delete(confirmId);
      toast.success('Deleted!');
      setConfirmId(null);
      load();
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  const move = async (index, dir) => {
    const arr = [...items];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    const updated = arr.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    setItems(updated);
    try {
      await navigationService.reorder({ items: updated.map(s => ({ id: s.id, sortOrder: s.sortOrder })) });
    } catch {
      toast.error('Failed to reorder.');
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No navigation items. Add one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-gray-600 font-medium w-16">Order</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Label</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">URL</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Visible</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex gap-0.5">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{item.label}</td>
                  <td className="px-5 py-3 text-gray-500">{item.url}</td>
                  <td className="px-5 py-3">
                    {item.isVisible ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-brand hover:text-brand-dark rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmId(item.id)} className="p-1.5 text-red-500 hover:text-red-700 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Navigation Item' : 'Add Navigation Item'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label <span className="text-red-500">*</span></label>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Home" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL <span className="text-red-500">*</span></label>
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand" placeholder="/about" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand" />
            <span className="text-sm text-gray-700">Visible in navigation</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60 flex items-center gap-2">
              {saving && <LoadingSpinner size="xs" />}{saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Navigation Item"
        message="Are you sure you want to delete this navigation item?"
        loading={!!deleting}
      />
    </div>
  );
}
