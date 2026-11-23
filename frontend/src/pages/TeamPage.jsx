import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, X, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import { teamService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  useEffect(() => {
    teamService.getAll().then(res => setMembers(Array.isArray(res.data) ? res.data : res.data?.team || [])).catch(() => setMembers([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4"><div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-3">Our Team</h1><p className="text-brand-cream/80 text-lg">The passionate people behind Sugandhika</p>
        <nav className="mt-4 text-sm text-brand-cream/60"><Link to="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><span className="text-white">Our Team</span></nav>
      </div></div>
      <div className="max-w-6xl mx-auto px-4 py-14">
        {loading ? <div className="flex justify-center py-24"><LoadingSpinner /></div> : members.length === 0 ? <EmptyState icon={Users} title="Team members coming soon" description="We're updating our team page." /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {members.map(member => <article key={member.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-brand-cream border-4 border-brand/20 mb-4 shrink-0">
                  {member.imageUrl ? <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users className="w-12 h-12 text-brand/30" /></div>}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3><p className="text-brand text-sm font-medium mt-0.5">{member.designation}</p>
                {member.department && <p className="text-xs text-gray-400 mt-1">{member.department}</p>}
                {member.bio && <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-3">{member.bio}</p>}
                <button type="button" onClick={() => setSelectedMember(member)} className="mt-5 px-5 py-2 rounded-lg bg-brand-cream text-brand-dark text-sm font-semibold hover:bg-brand hover:text-white transition-colors">View Full Profile</button>
              </div>
            </article>)}
          </div>
        )}
      </div>
      {selectedMember && <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${selectedMember.name} profile`} onClick={() => setSelectedMember(null)}>
        <div className="relative bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8" onClick={e => e.stopPropagation()}>
          <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200" aria-label="Close profile"><X className="w-5 h-5" /></button>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pr-8">
            {selectedMember.imageUrl && <img src={selectedMember.imageUrl} alt={selectedMember.name} className="w-28 h-28 rounded-full object-cover border-4 border-brand/20" />}
            <div className="text-center sm:text-left"><h2 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h2><p className="text-brand font-semibold mt-1">{selectedMember.designation}</p>{selectedMember.department && <p className="text-sm text-gray-500 mt-1">{selectedMember.department}</p>}</div>
          </div>
          {selectedMember.bio && <div className="mt-6"><h3 className="font-semibold text-gray-900 mb-2">About</h3><p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedMember.bio}</p></div>}
          {(selectedMember.socialLinks?.email || selectedMember.socialLinks?.phone) && <div className="mt-5 flex flex-wrap gap-4 text-sm">{selectedMember.socialLinks?.email && <a href={`mailto:${selectedMember.socialLinks.email}`} className="inline-flex items-center gap-2 text-brand"><Mail className="w-4 h-4" />{selectedMember.socialLinks.email}</a>}{selectedMember.socialLinks?.phone && <a href={`tel:${selectedMember.socialLinks.phone}`} className="inline-flex items-center gap-2 text-brand">{selectedMember.socialLinks.phone}</a>}</div>}
          {selectedMember.socialLinks && <div className="flex gap-3 mt-6">{Object.entries(selectedMember.socialLinks).filter(([,url]) => typeof url === 'string' && url).map(([key,url]) => <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="text-brand hover:text-brand-dark">{key.toLowerCase().includes('facebook') ? <Facebook /> : key.toLowerCase().includes('instagram') ? <Instagram /> : <Linkedin />}</a>)}</div>}
        </div>
      </div>}
    </div>
  );
}
