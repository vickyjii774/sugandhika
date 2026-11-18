import { useState, useEffect } from 'react';
import { usersService } from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import useToast from '../../hooks/useToast.js';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { Plus, Trash2, Shield } from 'lucide-react';

const ROLES = ['SUPER_ADMIN', 'CONTENT_ADMIN', 'EDITOR'];
const EMPTY_FORM = { name: '', email: '', password: '', role: 'EDITOR' };

const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  CONTENT_ADMIN: 'bg-blue-100 text-blue-700',
  EDITOR: 'bg-gray-100 text-gray-700',
};

export default function AdminUsers() {
  const toast = useToast();
  const { user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    usersService.getAll()
      .then(res => setUsers(res.data?.users || res.data || []))
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('All fields are required.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      await usersService.create(form);
      toast.success('User created!');
      setModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await usersService.delete(confirmId);
      toast.success('User deleted!');
      setConfirmId(null);
      load();
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Name</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Email</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Role</th>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Created</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center text-brand font-semibold text-sm">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                      {currentUser?.id === u.id && <span className="text-xs bg-brand-cream text-brand px-1.5 py-0.5 rounded">You</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                      <Shield className="w-3 h-3" />{u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-4 text-right">
                    {currentUser?.id !== u.id ? (
                      <button onClick={() => setConfirmId(u.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY_FORM); }} title="Add Admin User">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="Admin Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="admin@sugandhika.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClass} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputClass}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
            Users will be able to log in at /admin/login with these credentials.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
              {saving && <LoadingSpinner size="xs" />}{saving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Admin User"
        message="Are you sure? This action cannot be undone."
        confirmLabel="Delete User"
        loading={deleting}
      />
    </div>
  );
}
