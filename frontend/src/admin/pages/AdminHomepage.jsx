import { useState, useEffect } from 'react';
import { homepageService } from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';
import { Eye, EyeOff, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTION_LINKS = {
  banners: '/admin/banners',
  features: '/admin/features',
  products: '/admin/products',
  categories: '/admin/categories',
  team: '/admin/team',
  gallery: '/admin/gallery',
  faq: '/admin/faq',
  about: '/admin/about',
};

export default function AdminHomepage() {
  const toast = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    homepageService.getAll()
      .then(res => {
        const data = res.data?.sections || [];
        setSections(Array.isArray(data) ? data : Object.values(data));
      })
      .catch(() => toast.error('Failed to load homepage sections.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (section) => {
    setSaving(section.id);
    try {
      await homepageService.updateSection(section.sectionKey, { isEnabled: !section.isEnabled });
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, isEnabled: !s.isEnabled } : s));
      toast.success('Section updated!');
    } catch {
      toast.error('Failed to update section.');
    } finally {
      setSaving(null);
    }
  };

  const move = async (index, direction) => {
    const newSections = [...sections];
    const target = index + direction;
    if (target < 0 || target >= newSections.length) return;
    [newSections[index], newSections[target]] = [newSections[target], newSections[index]];
    const updated = newSections.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    setSections(updated);
    try {
      await homepageService.reorderSections({ sections: updated.map(s => ({ key: s.sectionKey, sortOrder: s.sortOrder })) });
      toast.success('Order saved!');
    } catch {
      toast.error('Failed to save order.');
      setSections(sections);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-sm text-gray-500 mt-1">Enable, disable and reorder homepage sections.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {sections.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No sections configured.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sections.map((section, i) => (
              <li key={section.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === sections.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center text-brand font-bold text-sm shrink-0">
                  {i + 1}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900 capitalize">{section.sectionKey?.replace(/_/g, ' ') || section.title}</p>
                  {section.title && section.sectionKey !== section.title && (
                    <p className="text-xs text-gray-500">{section.title}</p>
                  )}
                </div>

                {SECTION_LINKS[section.sectionKey] && (
                  <Link to={SECTION_LINKS[section.section]} className="text-xs text-brand hover:text-brand-dark flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />Edit Content
                  </Link>
                )}

                <button
                  onClick={() => toggle(section)}
                  disabled={saving === section.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${section.isEnabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {saving === section.id ? <LoadingSpinner size="xs" /> : section.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {section.isEnabled ? 'Visible' : 'Hidden'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
