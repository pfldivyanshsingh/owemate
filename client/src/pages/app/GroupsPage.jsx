import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Users, ArrowRight, Bell } from 'lucide-react';

function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await groupAPI.create(form);
      toast.success('Group created!');
      onCreated(res.data.group);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md p-8" style={{ padding: "1rem" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.2rem', color: 'var(--on-surface)' }}>
            Create Group
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} style={{ color: 'var(--outline)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--on-surface)' }}>Group Name *</label>
            <input
              id="group-name"
              placeholder="e.g. Trip to Goa, Flat 5B"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field w-full px-4 py-3 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--on-surface)' }}>Description</label>
            <textarea
              id="group-desc"
              placeholder="What is this group for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field w-full px-4 py-3 text-sm resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([groupAPI.getAll(), groupAPI.getInvitations()]).then(([gRes, iRes]) => {
      setGroups(gRes.data.groups || []);
      setInvitations(iRes.data.invitations || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteRespond = async (token, action) => {
    try {
      await groupAPI.respondToInvite(token, action);
      toast.success(action === 'accept' ? 'Joined group!' : 'Invitation declined');
      setInvitations((prev) => prev.filter((i) => i.token !== token));
      if (action === 'accept') {
        const res = await groupAPI.getAll();
        setGroups(res.data.groups || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to respond');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary-light)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="app-page animate-fadeInUp p-4" >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-heading">Groups</h1>
          <p className="page-subheading">Manage your shared expenses and members</p>
        </div>
        <button id="create-group-btn" onClick={() => setShowCreate(true)}
          className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
          <Plus size={16} /> New Group
        </button>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mb-8 p-1">
          <h2 className="flex items-center gap-2 mb-4"
            style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            <Bell size={18} style={{ color: 'var(--secondary)' }} />
            Pending Invitations ({invitations.length})
          </h2>
          <div className="space-y-3">
            {invitations.map((inv, i) => (
              <div key={inv.id} className="card-hover animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s`, background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'var(--surface-2)' }}>
                  👥
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {inv.group?.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--outline)' }}>
                    Invited by {inv.inviter?.name}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleInviteRespond(inv.token, 'reject')}
                    className="btn-secondary text-xs px-4 py-2">Decline</button>
                  <button onClick={() => handleInviteRespond(inv.token, 'accept')}
                    className="btn-primary text-xs px-4 py-2">Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6 animate-fadeInUp delay-100">
        <input
          id="group-search"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full px-4 py-3.5 text-sm max-w-sm"
        />
      </div>
      <br></br>
      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((group, i) => (
          <Link key={group.id} to={`/groups/${group.id}`}
            className="card-hover animate-scaleIn"
            style={{ textDecoration: 'none', background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.5rem', animationDelay: `${0.15 + i * 0.05}s` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white font-bold"
                style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))' }}>
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'Manrope', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                  {group.name}
                </p>
                <span className="chip text-xs mt-1" style={{ background: group.my_role === 'admin' ? 'var(--warning-bg)' : 'var(--surface-2)', color: group.my_role === 'admin' ? 'var(--warning)' : 'var(--text-muted)' }}>
                  {group.my_role === 'admin' ? '👑 Admin' : '👤 Member'}
                </span>
              </div>
            </div>
            {group.description && (
              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {group.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
              <Users size={14} />
              <span>View expenses & balances</span>
              <ArrowRight size={14} className="ml-auto" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="empty-state animate-fadeInUp delay-200" style={{ background: 'white', borderRadius: 24, border: '1px dashed var(--border-medium)' }}>
          <div className="empty-icon"><Users size={28} style={{ color: 'var(--text-muted)' }} /></div>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            {search ? 'No groups found' : 'No groups yet'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1rem', maxWidth: 300 }}>
            {search ? 'Try a different search term' : 'Create your first group to start splitting expenses'}
          </p>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm">
              <Plus size={16} /> Create First Group
            </button>
          )}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(g) => { setGroups((prev) => [g, ...prev]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}
