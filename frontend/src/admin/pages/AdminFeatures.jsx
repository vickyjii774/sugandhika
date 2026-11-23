import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { featuresService } from '../../services/api.service.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY = { icon: 'Leaf', title: '', description: '', imageUrl: '', isActive: true, sortOrder: 0 };
export default function AdminFeatures() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await featuresService.getAll(); setItems(Array.isArray(res.data) ? res.data : []); }
    catch { toast.error('Failed to load homepage features.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, sortOrder: items.length }); setModal(true); };
  const openEdit = item => { setEditing(item); setForm({ ...EMPTY, ...item }); setModal(true); };
  const save = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description are required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, imageUrl: form.imageUrl || null };
      if (editing) await featuresService.update(editing.id, payload);
      else await featuresService.create(payload);
      toast.success('Homepage feature saved.'); setModal(false); await load();
    } catch (err) { toast.error(err.message || 'Failed to save feature.'); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    try { await featuresService.delete(deleting.id); setDeleting(null); toast.success('Feature deleted.'); await load(); }
    catch (err) { toast.error(err.message || 'Failed to delete feature.'); }
  };
  const toggle = async item => {
    try { await featuresService.update(item.id, { isActive: !item.isActive }); await load(); }
    catch { toast.error('Could not update feature visibility.'); }
  };
  const move = async (index, direction) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const updated = next.map((item, sortOrder) => ({ ...item, sortOrder }));
    setItems(updated);
    try { await featuresService.reorder({ items: updated.map(item => ({ id: item.id, sortOrder: item.sortOrder })) }); }
    catch { toast.error('Could not save feature order.'); await load(); }
  };
  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand';
  return <div>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"><div><h1 className="text-2xl font-bold text-gray-900">Why Choose Us</h1><p className="text-sm text-gray-500 mt-1">Manage the cards shown in the homepage section.</p></div><button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4" />Add Feature</button></div>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {loading ? <div className="py-16 flex justify-center"><LoadingSpinner /></div> : items.length === 0 ? <p className="p-10 text-center text-gray-400">No features added yet.</p> : <div className="divide-y divide-gray-100">{items.map(item => <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-brand-cream" />}
        <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900">{item.title}</h3><p className="text-sm text-gray-500 line-clamp-2">{item.description}</p><p className="text-xs text-gray-400 mt-1">Icon: {item.icon || 'Leaf'}</p></div>
        <div className="flex items-center gap-2"><button onClick={() => move(items.findIndex(row => row.id === item.id), -1)} disabled={items.findIndex(row => row.id === item.id) === 0} className="text-gray-400 disabled:opacity-30" title="Move up"><ChevronUp className="w-4 h-4" /></button><button onClick={() => move(items.findIndex(row => row.id === item.id), 1)} disabled={items.findIndex(row => row.id === item.id) === items.length - 1} className="text-gray-400 disabled:opacity-30" title="Move down"><ChevronDown className="w-4 h-4" /></button><button onClick={() => toggle(item)} className="text-gray-500 hover:text-brand" title={item.isActive ? 'Hide' : 'Show'}>{item.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button><button onClick={() => openEdit(item)} className="text-brand"><Pencil className="w-4 h-4" /></button><button onClick={() => setDeleting(item)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></div>
      </div>)}</div>}
    </div>
    <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Feature' : 'Add Feature'} size="lg"><form onSubmit={save} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={input} required /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={input} required /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Icon name</label><input value={form.icon || ''} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className={input} placeholder="Leaf, Shield, Star..." /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label><input type="url" value={form.imageUrl || ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className={input} placeholder="https://example.com/image.jpg" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />Visible on homepage</label>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => setModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button><button disabled={saving} className="px-4 py-2 bg-brand text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Feature'}</button></div>
    </form></Modal>
    <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} title="Delete Feature" message={`Delete "${deleting?.title}"? This cannot be undone.`} />
  </div>;
}
