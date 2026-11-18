import { useState, useEffect } from 'react';
import { seoService } from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import useToast from '../../hooks/useToast.js';
import { Pencil, Save } from 'lucide-react';

const PAGES = ['home', 'about', 'products', 'team', 'gallery', 'faq', 'contact'];

export default function AdminSEO() {
  const toast = useToast();
  const [seoData, setSeoData] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ seoTitle: '', seoDescription: '', ogImage: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    seoService.getAll()
      .then(res => {
        const data = res.data?.seo || res.data || [];
        const map = {};
        (Array.isArray(data) ? data : Object.entries(data).map(([page, v]) => ({ page, ...v }))).forEach(item => {
          map[item.page] = item;
        });
        setSeoData(map);
      })
      .catch(() => toast.error('Failed to load SEO data.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openEdit = (page) => {
    const d = seoData[page] || {};
    setEditing(page);
    setForm({ seoTitle: d.seoTitle || '', seoDescription: d.seoDescription || '', ogImage: d.ogImage || '' });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await seoService.update(editing, form);
      toast.success('SEO settings saved!');
      setSeoData(prev => ({ ...prev, [editing]: { ...prev[editing], ...form, page: editing } }));
      setModal(false);
    } catch {
      toast.error('Failed to save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand';

  if (loading) return <div className="flex justify-center py-24"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage meta titles, descriptions and social images for each page.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-gray-600 font-medium">Page</th>
              <th className="px-5 py-3 text-left text-gray-600 font-medium">SEO Title</th>
              <th className="px-5 py-3 text-left text-gray-600 font-medium">Description</th>
              <th className="px-5 py-3 text-right text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PAGES.map(page => {
              const d = seoData[page] || {};
              return (
                <tr key={page} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900 capitalize">{page}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-[200px] truncate">{d.seoTitle || <span className="text-gray-300 italic">Not set</span>}</td>
                  <td className="px-5 py-4 text-gray-500 max-w-[260px] truncate">{d.seoDescription || <span className="text-gray-300 italic">Not set</span>}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(page)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-brand border border-brand rounded-lg text-xs hover:bg-brand hover:text-white transition-colors ml-auto">
                      <Pencil className="w-3.5 h-3.5" />Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={`SEO: ${editing?.charAt(0).toUpperCase() + editing?.slice(1)} Page`}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
            <input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
              className={inputClass} placeholder="Sugandhika – Natural Herbal Products" />
            <p className="text-xs text-gray-400 mt-1">{form.seoTitle.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))}
              rows={3} className={`${inputClass} resize-none`} placeholder="Discover natural herbal products from Nepal…" />
            <p className="text-xs text-gray-400 mt-1">{form.seoDescription.length}/160 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
            <input value={form.ogImage} onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
              className={inputClass} placeholder="https://…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
              {saving ? <LoadingSpinner size="xs" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
