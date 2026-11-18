import { useSettings } from '../context/SettingsContext.jsx';

export default function useSettingsHook() {
  return useSettings();
}

export { useSettings };
