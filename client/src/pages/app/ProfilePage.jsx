import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar_url: user?.avatar_url || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userAPI.updateMe(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page animate-fadeInUp max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="page-heading">Your Profile</h1>
        <p className="page-subheading">Manage your account settings and preferences</p>
      </div>

      {/* Avatar & Name Card */}
      <div className="animate-fadeInUp delay-100" style={{ background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 24, padding: '2.5rem', boxShadow: '0 4px 24px rgba(15,28,21,0.04)' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))' }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt={form.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="pt-2">
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              {user?.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 2 }}>{user?.email}</p>
            <div className="mt-3">
              <span className="chip" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {user?.role} Access
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              <User size={15} /> Full Name
            </label>
            <input
              id="profile-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field w-full px-4 py-3.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={15} /> Email
            </label>
            <input
              value={user?.email}
              className="input-field w-full px-4 py-3.5 text-sm cursor-not-allowed"
              style={{ background: 'var(--surface-1)', color: 'var(--text-muted)' }}
              disabled
            />
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--text-disabled)' }}>Email address cannot be changed</p>
          </div>
          <div className="pb-4">
            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-3.5 h-3.5 border-2 border-[var(--text-secondary)] rounded-sm" /> Avatar URL
            </label>
            <input
              id="profile-avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              className="input-field w-full px-4 py-3.5 text-sm"
            />
          </div>
          <button type="submit" disabled={loading}
            id="save-profile"
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
