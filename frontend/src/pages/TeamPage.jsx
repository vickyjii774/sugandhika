import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { teamService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamService.getAll()
      .then(res => setMembers(res.data?.team || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Our Team</h1>
          <p className="text-brand-cream/80 text-lg">The passionate people behind Sugandhika</p>
          <nav className="mt-4 text-sm text-brand-cream/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Our Team</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner /></div>
        ) : members.length === 0 ? (
          <EmptyState icon={Users} title="Team members coming soon" description="We're updating our team page." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map(member => (
              <div key={member.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-brand-cream border-4 border-brand/20 mb-4 shrink-0">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-brand/30" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-brand text-sm font-medium mt-0.5">{member.role}</p>
                  {member.bio && <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-4">{member.bio}</p>}
                  <div className="flex gap-3 mt-4">
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="text-xs text-brand hover:text-brand-dark underline">{member.email}</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
