import { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import { aboutService } from '../../services/api.service.js';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY_FORM = {
  title: '',
  story: '',
  mission: '',
  vision: '',
  values: '',
  quality_commitment: '',
};

export default function AdminAbout() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aboutService.get();
      const d = res?.data?.about ?? res?.data;
      if (d) {
        setForm({
          title: d.title ?? '',
          story: d.story ?? '',
          mission: d.mission ?? '',
          vision: d.vision ?? '',
          values: d.values ?? '',
          quality_commitment: d.quality_commitment ?? d.qualityCommitment ?? '',
        });
        if (d.image) setImagePreview(d.image);
      }
    } catch {
      toast.error('Failed to load About content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';
  const textareaClass = inputClass;

  if (loading) {
    return <div className="flex justify-center items-center py-24"><LoadingSpinner /></div>;
  }

  const fields = [
    { name: 'title', label: 'Page Title', type: 'input', placeholder: 'e.g. About Sugandhika' },
    { name: 'story', label: 'Our Story', type: 'textarea', rows: 5, placeholder: 'Tell the brand story…' },
    { name: 'mission', label: 'Mission', type: 'textarea', rows: 3, placeholder: 'Our mission statement…' },
    { name: 'vision', label: 'Vision', type: 'textarea', rows: 3, placeholder: 'Our vision for the future…' },
    { name: 'values', label: 'Values', type: 'textarea', rows: 3, placeholder: 'Core values…' },
    { name: 'quality_commitment', label: 'Quality Commitment', type: 'textarea', rows: 4, placeholder: 'Commitment to quality…' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">About Page</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                {f.type === 'input' ? (
                  <input
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder={f.placeholder}
                  />
                ) : (
                  <textarea
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    rows={f.rows}
                    className={textareaClass}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-4">
              About Image
            </h2>
            <ImageUpload
              preview={imagePreview}
              onFileSelect={(f, p) => { setImageFile(f); setImagePreview(p); }}
              label="Upload about image"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
