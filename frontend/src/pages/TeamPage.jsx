import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, X, Mail, Facebook, Instagram, Linkedin, Youtube, Music2, Phone } from 'lucide-react';
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
      </div></div>
      <div className="max-w-6xl mx-auto px-4 py-14">
        {loading ? <div className="flex justify-center py-24"><LoadingSpinner /></div> : members.length === 0 ? <EmptyState icon={Users} title="Team members coming soon" description="We're updating our team page." /> : (
        
<div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-8">
  {members.map((member) => (
    <article
      key={member._id}
      className="bg-white rounded-lg sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow min-w-0"
    >
      <div className="p-2 sm:p-5 md:p-6 flex flex-col items-center text-center">

        {/* Profile Image */}
        <div className="w-12 h-12 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-brand-cream border-2 sm:border-4 border-brand/20 mb-2 sm:mb-4 shrink-0">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-10 sm:h-10 text-brand/30" />
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-[9px] sm:text-base md:text-lg font-bold text-gray-900 leading-tight break-words w-full">
          {member.name}
        </h3>

        {/* Designation */}
        <p className="text-brand text-[8px] sm:text-sm font-medium mt-1 leading-tight break-words w-full">
          {member.designation}
        </p>

        {/* Department */}
        {member.department && (
          <p className="text-[7px] sm:text-xs text-gray-400 mt-1 leading-tight break-words w-full">
            {member.department}
          </p>
        )}

        {/* Bio */}
        {member.bio && (
          <p className="text-gray-500 text-[7px] sm:text-xs md:text-sm mt-2 sm:mt-3 leading-relaxed line-clamp-3">
            {member.bio}
          </p>
        )}

        {/* View Profile Button */}
        <button
          type="button"
          onClick={() => setSelectedMember(member)}
          className="mt-2 sm:mt-5 px-1.5 py-1 sm:px-5 sm:py-2 rounded-md sm:rounded-lg bg-brand-cream text-brand-dark text-[7px] sm:text-xs md:text-sm font-semibold hover:bg-brand hover:text-white transition-colors w-full"
        >
          View Profile
        </button>

      </div>
    </article>
  ))}
</div>

        )}
      </div>
      {selectedMember && <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${selectedMember.name} profile`} onClick={() => setSelectedMember(null)}>
        <div className="relative bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8" onClick={e => e.stopPropagation()}>
          <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200" aria-label="Close profile"><X className="w-5 h-5" /></button>
          <div className="pr-8">
            <div className="text-center sm:text-left"><h2 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h2><p className="text-brand font-semibold mt-1">{selectedMember.designation}</p>{selectedMember.department && <p className="text-sm text-gray-500 mt-1">{selectedMember.department}</p>}</div>
            {selectedMember.imageUrl && <img src={selectedMember.imageUrl} alt={selectedMember.name} className="mt-5 w-full h-56 sm:h-72 rounded-xl object-cover border border-brand/20" />}
          </div>
          {selectedMember.bio && <div className="mt-6"><h3 className="font-semibold text-gray-900 mb-2">About</h3><p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedMember.bio}</p></div>}
          {(selectedMember.socialLinks?.email || selectedMember.socialLinks?.phone) && <div className="mt-5 flex flex-wrap gap-4 text-sm">{selectedMember.socialLinks?.email && <a href={`mailto:${selectedMember.socialLinks.email}`} className="inline-flex items-center gap-2 text-brand"><Mail className="w-4 h-4" />{selectedMember.socialLinks.email}</a>}{selectedMember.socialLinks?.phone && <a href={`tel:${selectedMember.socialLinks.phone}`} className="inline-flex items-center gap-2 text-brand">{selectedMember.socialLinks.phone}</a>}</div>}
          {selectedMember.socialLinks && <div className="flex gap-3 mt-6">{Object.entries(selectedMember.socialLinks).filter(([,url]) => typeof url === 'string' && url).map(([key,url]) => <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="text-brand hover:text-brand-dark">{key.toLowerCase().includes('facebook') ? <Facebook /> : key.toLowerCase().includes('instagram') ? <Instagram /> : <Linkedin />}</a>)}</div>}
        </div>
      </div>}
    </div>
  );
}
