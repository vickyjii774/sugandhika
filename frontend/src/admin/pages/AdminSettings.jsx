
import { useState, useEffect } from 'react';
import {
  settingsService,
  contactService,
  authService
} from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import useToast from '../../hooks/useToast.js';
import { Save, LockKeyhole, Eye, EyeOff } from 'lucide-react';

export default function AdminSettings() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  const [general, setGeneral] = useState({
    siteName: '',
    tagline: '',
    description: ''
  });

  const [social, setSocial] = useState({
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: ''
  });

  const [contact, setContact] = useState({
    phone: '',
    email: '',
    whatsapp: '',
    address: '',
    businessHours: ''
  });

  const [branding, setBranding] = useState({
    logoUrl: '',
    faviconUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    Promise.all([
      settingsService.get(),
      contactService.get()
    ])
      .then(([sRes, cRes]) => {
        const s = sRes.data || {};

        setGeneral({
          siteName: s.siteName || 'Sugandhika',
          tagline: s.tagline || '',
          description: s.description || ''
        });

        setSocial({
          facebookUrl: s.facebookUrl || '',
          instagramUrl: s.instagramUrl || '',
          youtubeUrl: s.youtubeUrl || '',
          twitterUrl: s.twitterUrl || ''
        });

        setBranding({
          logoUrl: s.logo || s.logoUrl || '',
          faviconUrl: s.favicon || s.faviconUrl || ''
        });

        const c = cRes.data || {};

        setContact({
          phone: c.phone || '',
          email: c.email || '',
          whatsapp: c.whatsapp || '',
          address: c.address || '',
          businessHours: c.businessHours || ''
        });
      })
      .catch(() => toast.error('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const saveGeneral = async (e) => {
    e.preventDefault();
    setSaving('general');

    try {
      await settingsService.update({ ...general, ...social, logo: branding.logoUrl || undefined, favicon: branding.faviconUrl || undefined });
      window.dispatchEvent(new Event('sugandhika:settings-updated'));

      if (logoFile) {
        const fd = new FormData();
        fd.append('image', logoFile);
        await settingsService.uploadLogo(fd);
      }

      if (faviconFile) {
        const fd = new FormData();
        fd.append('image', faviconFile);
        await settingsService.uploadFavicon(fd);
      }

      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(null);
    }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setSaving('contact');

    try {
      await contactService.update(contact);
      window.dispatchEvent(new Event('sugandhika:settings-updated'));
      toast.success('Contact information saved!');
    } catch {
      toast.error('Failed to save contact information.');
    } finally {
      setSaving(null);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please complete all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('Your new password must be different.');
      return;
    }

    setSaving('password');

    try {
      const result = await authService.changePassword({
        currentPassword,
        newPassword
      });

      if (!result.success) {
        throw new Error(result.message || 'Password change failed.');
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(
        error.message || 'Unable to change password. Please try again.'
      );
    } finally {
      setSaving(null);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

  const labelClass =
    'block text-sm font-medium text-gray-700 mb-1.5';

  const passwordFields = [
    {
      key: 'currentPassword',
      label: 'Current Password',
      visibility: 'current',
      autocomplete: 'current-password'
    },
    {
      key: 'newPassword',
      label: 'New Password',
      visibility: 'new',
      autocomplete: 'new-password'
    },
    {
      key: 'confirmPassword',
      label: 'Confirm New Password',
      visibility: 'confirm',
      autocomplete: 'new-password'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Site Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your website information, branding and administrator security.
        </p>
      </div>

      {/* General Settings */}
      <form
        onSubmit={saveGeneral}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 border-gray-100">
          General Settings
        </h2>

        <div>
          <label className={labelClass}>Site Name</label>
          <input
            value={general.siteName}
            onChange={(e) =>
              setGeneral(g => ({ ...g, siteName: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Tagline</label>
          <input
            value={general.tagline}
            onChange={(e) =>
              setGeneral(g => ({ ...g, tagline: e.target.value }))
            }
            className={inputClass}
            placeholder="Pure Nature, Pure Sugandhika"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={general.description}
            onChange={(e) =>
              setGeneral(g => ({ ...g, description: e.target.value }))
            }
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <h3 className="text-base font-semibold text-gray-800 mt-2">
          Social Media
        </h3>

        {[
          ['facebookUrl', 'Facebook URL'],
          ['instagramUrl', 'Instagram URL'],
          ['youtubeUrl', 'YouTube URL'],
          ['twitterUrl', 'X / Twitter URL']
        ].map(([key, label]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              value={social[key]}
              onChange={(e) =>
                setSocial(s => ({ ...s, [key]: e.target.value }))
              }
              className={inputClass}
              placeholder={`https://${key}.com/...`}
            />
          </div>
        ))}

        <h3 className="text-base font-semibold text-gray-800 mt-2">
          Branding
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Logo</label>
            <ImageUpload value={branding.logoUrl} onChange={setLogoFile} label="Upload Logo" />
            <input type="url" value={branding.logoUrl} onChange={e => { setBranding(b => ({ ...b, logoUrl: e.target.value })); setLogoFile(null); }} placeholder="Or paste logo image URL" className={inputClass + ' mt-2'} />
          </div>

          <div>
            <label className={labelClass}>Favicon</label>
            <ImageUpload value={branding.faviconUrl} onChange={setFaviconFile} label="Upload Favicon" accept="image/x-icon,image/png,image/ico" />
            <input type="url" value={branding.faviconUrl} onChange={e => { setBranding(b => ({ ...b, faviconUrl: e.target.value })); setFaviconFile(null); }} placeholder="Or paste favicon image URL" className={inputClass + ' mt-2'} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving === 'general'}
            className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
          >
            {saving === 'general'
              ? <LoadingSpinner size="xs" />
              : <Save className="w-4 h-4" />}
            {saving === 'general' ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Contact Information */}
      <form
        onSubmit={saveContact}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 border-gray-100">
          Contact Information
        </h2>

        {[
          ['phone', 'Phone', 'tel'],
          ['email', 'Email', 'email'],
          ['whatsapp', 'WhatsApp Number', 'text'],
          ['address', 'Address', 'text'],
          ['businessHours', 'Business Hours', 'text']
        ].map(([key, label, type]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              type={type}
              value={contact[key]}
              onChange={(e) =>
                setContact(c => ({ ...c, [key]: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving === 'contact'}
            className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
          >
            {saving === 'contact'
              ? <LoadingSpinner size="xs" />
              : <Save className="w-4 h-4" />}
            {saving === 'contact' ? 'Saving...' : 'Save Contact Info'}
          </button>
        </div>
      </form>

      {/* Change Admin Password */}
      <form
        onSubmit={handlePasswordChange}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
            <LockKeyhole className="w-5 h-5 text-brand" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Change Password
            </h2>
            <p className="text-sm text-gray-500">
              Update your administrator account password.
            </p>
          </div>
        </div>

        {passwordFields.map(field => (
          <div key={field.key}>
            <label className={labelClass}>
              {field.label}
            </label>

            <div className="relative">
              <input
                type={
                  showPasswords[field.visibility]
                    ? 'text'
                    : 'password'
                }
                autoComplete={field.autocomplete}
                value={passwordForm[field.key]}
                onChange={(e) =>
                  setPasswordForm(p => ({
                    ...p,
                    [field.key]: e.target.value
                  }))
                }
                className={`${inputClass} pr-11`}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                required
                minLength={field.key === 'currentPassword' ? undefined : 8}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPasswords(p => ({
                    ...p,
                    [field.visibility]: !p[field.visibility]
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label={
                  showPasswords[field.visibility]
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPasswords[field.visibility]
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
          <p className="text-xs text-gray-600">
            Your new password must contain at least 8 characters.
            Your current password is required to authorize this change.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving === 'password'}
            className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
          >
            {saving === 'password'
              ? <LoadingSpinner size="xs" />
              : <LockKeyhole className="w-4 h-4" />}

            {saving === 'password'
              ? 'Updating Password...'
              : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
