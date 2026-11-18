import { useState, useEffect } from 'react';
import { settingsService, contactService } from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import useToast from '../../hooks/useToast.js';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  const [general, setGeneral] = useState({ siteName: '', tagline: '', description: '' });
  const [social, setSocial] = useState({ facebook: '', instagram: '', youtube: '', tiktok: '' });
  const [contact, setContact] = useState({ phone: '', email: '', whatsapp: '', address: '', business_hours: '' });
  const [branding, setBranding] = useState({ logoUrl: '', faviconUrl: '' });

  useEffect(() => {
    Promise.all([settingsService.get(), contactService.get()])
      .then(([sRes, cRes]) => {
        const s = sRes.data || {};
        setGeneral({ siteName: s.siteName || 'Sugandhika', tagline: s.tagline || '', description: s.description || '' });
        setSocial({ facebook: s.facebook || '', instagram: s.instagram || '', youtube: s.youtube || '', tiktok: s.tiktok || '' });
        setBranding({ logoUrl: s.logoUrl || '', faviconUrl: s.faviconUrl || '' });
        const c = cRes.data || {};
        setContact({ phone: c.phone || '', email: c.email || '', whatsapp: c.whatsapp || '', address: c.address || '', business_hours: c.business_hours || '' });
      })
      .catch(() => toast.error('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const saveGeneral = async (e) => {
    e.preventDefault();
    setSaving('general');
    try {
      await settingsService.update({ ...general, ...social });
      if (logoFile) {
        const fd = new FormData(); fd.append('logo', logoFile);
        await settingsService.uploadLogo(fd);
      }
      if (faviconFile) {
        const fd = new FormData(); fd.append('favicon', faviconFile);
        await settingsService.uploadFavicon(fd);
      }
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(null); }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setSaving('contact');
    try {
      await contactService.update(contact);
      toast.success('Contact info saved!');
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(null); }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  if (loading) return <div className="flex justify-center py-24"><LoadingSpinner /></div>;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>

      {/* General */}
      <form onSubmit={saveGeneral} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 border-gray-100">General</h2>
        <div>
          <label className={labelClass}>Site Name</label>
          <input value={general.siteName} onChange={e => setGeneral(g => ({ ...g, siteName: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tagline</label>
          <input value={general.tagline} onChange={e => setGeneral(g => ({ ...g, tagline: e.target.value }))} className={inputClass} placeholder="Pure Nature, Pure Sugandhika" />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea value={general.description} onChange={e => setGeneral(g => ({ ...g, description: e.target.value }))} rows={3} className={`${inputClass} resize-none`} />
        </div>

        <h3 className="text-base font-semibold text-gray-800 mt-2">Social Media</h3>
        {[['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['youtube', 'YouTube URL'], ['tiktok', 'TikTok URL']].map(([key, label]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input value={social[key]} onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))} className={inputClass} placeholder={`https://${key}.com/...`} />
          </div>
        ))}

        <h3 className="text-base font-semibold text-gray-800 mt-2">Branding</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Logo</label>
            <ImageUpload value={branding.logoUrl} onChange={setLogoFile} label="Upload Logo" />
          </div>
          <div>
            <label className={labelClass}>Favicon</label>
            <ImageUpload value={branding.faviconUrl} onChange={setFaviconFile} label="Upload Favicon" accept="image/x-icon,image/png,image/ico" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving === 'general'}
            className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
            {saving === 'general' ? <LoadingSpinner size="xs" /> : <Save className="w-4 h-4" />}
            {saving === 'general' ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Contact */}
      <form onSubmit={saveContact} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 border-gray-100">Contact Information</h2>
        {[['phone', 'Phone', 'tel'], ['email', 'Email', 'email'], ['whatsapp', 'WhatsApp Number (e.g. 9779801234567)', 'text'], ['address', 'Address', 'text'], ['business_hours', 'Business Hours', 'text']].map(([key, label, type]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input type={type} value={contact[key]} onChange={e => setContact(c => ({ ...c, [key]: e.target.value }))} className={inputClass} />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving === 'contact'}
            className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
            {saving === 'contact' ? <LoadingSpinner size="xs" /> : <Save className="w-4 h-4" />}
            {saving === 'contact' ? 'Saving…' : 'Save Contact Info'}
          </button>
        </div>
      </form>
    </div>
  );
}
