import { useState, useEffect } from 'react';
import { homepageService } from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import useToast from '../../hooks/useToast.js';
import { Plus, Trash2, Eye, EyeOff, Pencil, X, Save } from 'lucide-react';

const EMPTY_BANNER = {
  title: '', subtitle: '', description: '',
  buttonLabel: 'Shop Now', buttonUrl: '/products',
  secondButtonLabel: 'Contact Us', secondButtonUrl: '/contact',
  isActive: true,
};

export default function AdminBanners() {
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    homepageService.getBanners()
      .then(res => {
        const b = res?.data ?? [];
        setBanners(Array.isArray(b) ? b : []);
      })
      .catch(() => toast.error('Failed to load banners.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_BANNER); setImageFile(null); };
  const openEdit = (banner) => { setEditing(banner); setForm({ ...EMPTY_BANNER, ...banner }); setImageFile(null); };
  const closeForm = () => { setEditing(undefined); setImageFile(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Heading is required.'); return; }
    setSaving(true);
    try {
      let saved;
      if (editing?.id) {
        saved = await homepageService.updateBanner(editing.id, form);
      } else {
        saved = await homepageService.createBanner(form);
      }
      if (imageFile && saved?.data?.id) {
        const fd = new FormData(); fd.append('image', imageFile);
        await homepageService.updateBanner(saved.data.id, fd);
      }
      toast.success('Banner saved!');
      closeForm();
      load();
    } catch { toast.error('Failed to save banner.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await homepageService.deleteBanner(confirmId);
      toast.success('Banner deleted!');
      setConfirmId(null);
      load();
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(false); }
  };

  const toggleActive = async (banner) => {
    try {
      await homepageService.updateBanner(banner.id, { isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
    } catch { toast.error('Failed to update.'); }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const isFormOpen = editing !== undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Banner List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner /></div>
          ) : banners.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-400">
              No banners yet. Add one to get started.
            </div>
          ) : (
            banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {banner.imageUrl && (
                  <div className="h-24 bg-brand-cream overflow-hidden">
                    <img src={banner.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{banner.title}</h3>
                      {banner.subtitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{banner.subtitle}</p>}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => openEdit(banner)}
                      className="flex items-center gap-1 px-3 py-1.5 text-brand border border-brand rounded text-xs hover:bg-brand hover:text-white transition-colors">
                      <Pencil className="w-3.5 h-3.5" />Edit
                    </button>
                    <button onClick={() => toggleActive(banner)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors text-gray-600">
                      {banner.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {banner.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => setConfirmId(banner.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded ml-auto">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Panel */}
      {isFormOpen && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{editing?.id ? 'Edit Banner' : 'New Banner'}</h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className={labelClass}>Heading <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} placeholder="Pure Nature, Pure Sugandhika" />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Button 1 Label</label>
                <input value={form.buttonLabel} onChange={e => setForm(f => ({ ...f, buttonLabel: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Button 1 URL</label>
                <input value={form.buttonUrl} onChange={e => setForm(f => ({ ...f, buttonUrl: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Button 2 Label</label>
                <input value={form.secondButtonLabel} onChange={e => setForm(f => ({ ...f, secondButtonLabel: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Button 2 URL</label>
                <input value={form.secondButtonUrl} onChange={e => setForm(f => ({ ...f, secondButtonUrl: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Background Image</label>
              <ImageUpload preview={editing?.imageUrl ?? ''} onFileSelect={(file) => setImageFile(file)} label="Upload banner image" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-brand" />
              <span className="text-sm text-gray-700">Active (show on homepage)</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
                {saving ? <LoadingSpinner size="xs" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={handleDelete} title="Delete Banner"
        message="Are you sure you want to delete this banner?" loading={deleting}
      />
    </div>
  );
}
