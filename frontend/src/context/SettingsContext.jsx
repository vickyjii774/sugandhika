import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/api.service.js';

const SettingsContext = createContext(null);
const DEFAULTS = { siteName: 'Sugandhika', tagline: 'Pure Eco Fragrance', phone: '', email: '', address: '', whatsapp: '', facebookUrl: '', instagramUrl: '', youtubeUrl: '' };

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshSettings = useCallback(async () => {
    try {
      const result = await settingsService.get();
      if (result.success) setSettings({ ...DEFAULTS, ...(result.data || {}) });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    refreshSettings();
    const onUpdate = () => refreshSettings();
    window.addEventListener('sugandhika:settings-updated', onUpdate);
    return () => window.removeEventListener('sugandhika:settings-updated', onUpdate);
  }, [refreshSettings]);

  const updateSettings = (newSettings) => setSettings(prev => ({ ...prev, ...newSettings }));
  return <SettingsContext.Provider value={{ settings, isLoading, error, updateSettings, refreshSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
export default SettingsContext;
