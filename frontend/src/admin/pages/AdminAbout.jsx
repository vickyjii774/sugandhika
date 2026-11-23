import { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import { aboutService } from '../../services/api.service.js';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY_FORM = { title: '', subtitle: '', story: '', mission: '', vision: '', values: '', qualityCommitment: '', imageUrl: '' };

const toEditorText = value => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(item => toEditorText(item)).filter(Boolean).join('\\n\\n');
  if (value && typeof value === 'object') return [value.title, value.description, value.text, value.content].filter(item => typeof item === 'string' || typeof item === 'number').map(String).join('\\n\\n');
  return '';
};

export default function AdminAbout() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aboutService.get();
      const d = res?.data || {};
      setForm({
        title: toEditorText(d.title),
        subtitle: toEditorText(d.subtitle ?? d.content?.subtitle),
        story: toEditorText(d.story ?? d.content?.story),
        mission: toEditorText(d.mission ?? d.content?.mission),
        vision: toEditorText(d.vision ?? d.content?.vision),
        values: toEditorText(d.values ?? d.content?.values),
        qualityCommitment: toEditorText(d.qualityCommitment ?? d.quality_commitment ?? d.content?.qualityCommitment),
        imageUrl: toEditorText(d.imageUrl ?? d.content?.imageUrl),
      });
    } catch { toast.error('Failed to load About content.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await aboutService.update(form);
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        await aboutService.uploadImage(fd);
      }
      toast.success('About page updated!');
      await fetchData();
    } catch (err) { toast.error(err.message || 'Failed to save About page.'); }
    finally { setSaving(false); }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand';
  const fields = [
    ['title', 'Page Title', 'input'], ['subtitle', 'Introduction / Subtitle', 'textarea'], ['story', 'Our Story', 'textarea'],
    ['mission', 'Mission', 'textarea'], ['vision', 'Vision', 'textarea'],
    ['values', 'Our Values', 'textarea'], ['qualityCommitment', 'Quality Commitment', 'textarea'],
  ];
  if (loading) return <div className="flex justify-center py-24"><LoadingSpinner /></div>;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">About Page</h1>
      <p className="text-sm text-gray-500 mb-6">Edit the content visitors see on the public About Us page.</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
          {fields.map(([name, label, type]) => <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {type === 'input'
              ? <input name={name} value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className={inputClass} />
              : <textarea name={name} value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} rows={4} className={inputClass} />}
          </div>)}
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <ImageUpload value={form.imageUrl} onChange={file => { setImageFile(file); if (!file) setForm(p => ({ ...p, imageUrl: '' })); }} label="About image" />
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Or use an image URL</label>
            <input type="url" value={form.imageUrl} onChange={e => { setForm(p => ({ ...p, imageUrl: e.target.value })); setImageFile(null); }} placeholder="https://example.com/image.jpg" className={inputClass} />
          </div>
          <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-lg disabled:opacity-60">
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
