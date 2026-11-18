import { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/api.service.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const result = await settingsService.get();
        if (result.success) {
          setSettings(result.data);
        }
      } catch (err) {
        setError(err.message);
        // Use defaults on error
        setSettings({
          siteName: 'Sugandhika',
          tagline: 'Pure Eco Fragrance',
          phone: '',
          email: '',
          address: '',
          whatsappNumber: '',
          socialLinks: {},
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
