import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, expenseAPI, balanceAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, UserPlus, Trash2, Settings, Users, Receipt,
  TrendingUp, X, Send, LogOut
} from 'lucide-react';
import { format } from 'date-fns';

// -------- Add Expense Modal --------
function AddExpenseModal({ groupId, members, categories, onClose, onAdded }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'),
    paid_by: user.id, category_id: '', split_method: 'equal', notes: ''
  });
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.split_method !== 'equal') payload.splits = splits;
      const res = await expenseAPI.addExpense(groupId, payload);
      toast.success('Expense added!');
      onAdded(res.data.expense);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const updateSplit = (userId, field, value) => {
    setSplits((prev) => {
      const existing = prev.find((s) => s.user_id === userId);
      if (existing) return prev.map((s) => s.user_id === userId ? { ...s, [field]: value } : s);
      return [...prev, { user_id: userId, [field]: value }];
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-lg p-8 my-4" style={{ padding: "1rem" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.2rem', color: 'var(--on-surface)' }}>
            Add Expense
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Title *</label>
              <input id="expense-title" placeholder="e.g. Dinner at rooftop"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field w-full px-4 py-2.5 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Amount (₹) *</label>
              <input id="expense-amount" type="number" min="0.01" step="0.01" placeholder="0.00"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-field w-full px-4 py-2.5 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Date *</label>
              <input id="expense-date" type="date"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field w-full px-4 py-2.5 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Paid By *</label>
              <select id="expense-paidby" value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })}
                className="input-field w-full px-4 py-2.5 text-sm">
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.user?.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Category</label>
              <select id="expense-category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input-field w-full px-4 py-2.5 text-sm">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Split Method</label>
              <div className="flex gap-2 flex-wrap">
                {['equal', 'unequal', 'percentage', 'selective'].map((m) => (
                  <button key={m} type="button"
                    onClick={() => setForm({ ...form, split_method: m })}
                    className="px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
                    style={form.split_method === m
                      ? { background: 'var(--primary)', color: 'white' }
                      : { background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {['unequal', 'percentage', 'selective'].includes(form.split_method) && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}>
                  {form.split_method === 'percentage' ? 'Percentages' : 'Amounts'} per person
                </label>
                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <span className="text-sm flex-1" style={{ color: 'var(--on-surface)' }}>{m.user?.name}</span>
                      {form.split_method === 'selective' ? (
                        <input type="checkbox" onChange={(e) => {
                          if (e.target.checked) updateSplit(m.user_id, 'user_id', m.user_id);
                          else setSplits((prev) => prev.filter((s) => s.user_id !== m.user_id));
                        }} className="w-4 h-4" />
                      ) : (
                        <input type="number" min="0" step="0.01"
                          placeholder={form.split_method === 'percentage' ? '0%' : '0.00'}
                          className="input-field w-28 px-3 py-1.5 text-sm"
                          onChange={(e) => updateSplit(m.user_id, form.split_method === 'percentage' ? 'percentage' : 'amount', parseFloat(e.target.value))} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes..." className="input-field w-full px-4 py-2.5 text-sm resize-none" rows={2} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
            <button type="submit" disabled={loading} id="add-expense-submit"
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------- Invite Modal --------
function InviteModal({ groupId, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await groupAPI.invite(groupId, email);
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-sm p-8" style={{ padding: "1rem" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.2rem', color: 'var(--on-surface)' }}>
            Invite Member
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleInvite} className="space-y-4">
          <input id="invite-email" type="email" placeholder="friend@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full px-4 py-3 text-sm" required />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><Send size={14} /> Send</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------- Settle Up Modal --------
function SettleUpModal({ groupId, balances, members, onClose, onSettled }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ to_user: '', amount: '', note: '' });
  const [loading, setLoading] = useState(false);

  const myDebts = balances.filter((b) => b.from === user.id);

  const handleSettle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await balanceAPI.settleUp(groupId, form);
      toast.success('Payment recorded!');
      onSettled();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-sm p-8" style={{ padding: "1rem" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.2rem', color: 'var(--on-surface)' }}>Settle Up</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={18} /></button>
        </div>
        {myDebts.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl" style={{ background: 'var(--surface-container-low)' }}>
            {myDebts.map((d) => {
              const toMember = members.find((m) => m.user_id === d.to);
              return (
                <button key={d.to} type="button"
                  onClick={() => setForm({ ...form, to_user: d.to, amount: d.amount.toString() })}
                  className="flex items-center justify-between w-full text-sm py-1.5">
                  <span style={{ color: 'var(--on-surface)' }}>You owe {toMember?.user?.name}</span>
                  <span style={{ color: 'var(--tertiary)', fontWeight: 700 }}>₹{d.amount}</span>
                </button>
              );
            })}
          </div>
        )}
        <form onSubmit={handleSettle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Pay To</label>
            <select value={form.to_user} onChange={(e) => setForm({ ...form, to_user: e.target.value })}
              className="input-field w-full px-4 py-2.5 text-sm" required>
              <option value="">Select person</option>
              {members.filter((m) => m.user_id !== user.id).map((m) => (
                <option key={m.user_id} value={m.user_id}>{m.user?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Amount (₹)</label>
            <input type="number" min="0.01" step="0.01" placeholder="0.00"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field w-full px-4 py-2.5 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Note</label>
            <input placeholder="e.g. UPI payment" value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input-field w-full px-4 py-2.5 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------- Main Group Detail --------
export default function GroupDetailPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const { joinGroup, leaveGroup, socket } = useSocket();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ balances: [], netBalances: [] });
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('expenses'); // expenses | balances | members
  const [modals, setModals] = useState({ addExpense: false, invite: false, settleUp: false });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [gRes, eRes, bRes, cRes] = await Promise.all([
        groupAPI.getById(groupId),
        expenseAPI.getGroupExpenses(groupId),
        balanceAPI.getGroupBalances(groupId),
        categoryAPI.getAll(),
      ]);
      const g = gRes.data.group;
      setGroup(g);
      setMembers(g.members || []);
      setExpenses(eRes.data.expenses || []);
      setBalances(bRes.data);
      setCategories(cRes.data.categories || []);
      const myMember = (g.members || []).find((m) => m.user_id === user?.id);
      setIsAdmin(myMember?.role === 'admin');
    } catch (err) {
      toast.error('Failed to load group');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }, [groupId, user?.id, navigate]);

  useEffect(() => {
    fetchAll();
    joinGroup(groupId);
    return () => leaveGroup(groupId);
  }, [groupId]);

  // Socket.io realtime updates
  useEffect(() => {
    if (!socket) return;
    
    // We remove the manual append here so that we don't duplicate expenses if fetchAll returns the newly added one.
    // Calling fetchAll() perfectly syncs everything (expenses, balances, members).
    const onUpdate = () => {
      fetchAll();
    };

    socket.on('expense_added', onUpdate);
    socket.on('expense_updated', onUpdate);
    socket.on('expense_deleted', onUpdate);
    socket.on('payment_settled', onUpdate);
    socket.on('member_added', onUpdate);

    return () => {
      socket.off('expense_added', onUpdate);
      socket.off('expense_updated', onUpdate);
      socket.off('expense_deleted', onUpdate);
      socket.off('payment_settled', onUpdate);
      socket.off('member_added', onUpdate);
    };
  }, [socket, fetchAll]);

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    try {
      await groupAPI.leave(groupId);
      toast.success('Left group');
      navigate('/groups');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot leave group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      await groupAPI.delete(groupId);
      toast.success('Group deleted');
      navigate('/groups');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete group');
    }
  };

  const handleRemoveMember = async (uid) => {
    if (!confirm('Remove this member?')) return;
    try {
      await groupAPI.removeMember(groupId, uid);
      toast.success('Member removed');
      fetchAll();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Delete this expense? This will revert all related splits.')) return;
    try {
      await expenseAPI.deleteExpense(id);
      toast.success('Expense deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const myBalance = balances.netBalances?.find((nb) => nb.user?.id === user.id)?.balance || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary-light)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="app-page animate-fadeInUp p-4" style={{ padding: "1rem" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/groups')} className="p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div className="flex-1 pt-1">
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {group?.name}
            </h1>
            {group?.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModals({ ...modals, invite: true })}
            className="btn-secondary text-sm px-5 py-2.5 flex items-center gap-2">
            <UserPlus size={16} /> Invite
          </button>
          <button onClick={() => setModals({ ...modals, addExpense: true })}
            className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>
      <br></br>
      {/* Balance Banner */}
      <div className="animate-fadeInUp delay-100 mb-4 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ borderRadius: 20, boxShadow: '0 8px 32px rgba(15,28,21,0.08)', background: myBalance >= 0 ? 'linear-gradient(135deg, #005538, #10B981)' : 'linear-gradient(135deg, #811e1e, #fc7c78)' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            {myBalance >= 0 ? 'You are owed' : 'You owe'}
          </p>
          <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '2.5rem', color: 'white', lineHeight: 1 }}>
            ₹{Math.abs(myBalance).toLocaleString('en-IN')}
          </p>
        </div>
        {myBalance < 0 && (
          <button onClick={() => setModals({ ...modals, settleUp: true })}
            className="sm:ml-auto px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-transform hover:scale-105"
            style={{ background: 'white', color: 'var(--tertiary)' }}>
            Settle Up
          </button>
        )}
      </div>
      <br></br>
      {/* Tabs */}
      <div className="flex gap-2 p-1 mb-4 rounded-xl animate-fadeInUp delay-200" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', maxWidth: 'fit-content' }}>
        {[
          { id: 'expenses', label: 'Expenses', icon: Receipt },
          { id: 'balances', label: 'Balances', icon: TrendingUp },
          { id: 'members', label: 'Members', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={tab === id
              ? { background: 'white', color: 'var(--primary-dark)', boxShadow: '0 2px 12px rgba(15,28,21,0.08)' }
              : { color: 'var(--text-muted)' }}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeInUp delay-300">
        {tab === 'expenses' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Receipt size={28} style={{ color: 'var(--text-muted)' }} /></div>
                <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>No expenses yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Add the first one to start splitting!</p>
              </div>
            ) : expenses.map((expense, i) => (
              <div key={expense.id} className="row-hover animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s`, padding: '1rem', background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'var(--surface-2)' }}>
                    {expense.category?.icon || '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                      {expense.title}
                    </p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Paid by <strong style={{ color: 'var(--text-primary)' }}>{expense.paid_by_user?.name}</strong> · {format(new Date(expense.date), 'MMM d')}
                    </p>
                  </div>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                  </p>
                  {(isAdmin || (expense.added_by ? expense.added_by === user.id : expense.paid_by === user.id)) && (
                    <button onClick={() => handleDeleteExpense(expense.id)} style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--surface-1)', border: 'none', color: 'var(--tertiary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                {expense.splits?.length > 0 && (
                  <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: '1px dashed var(--border-medium)' }}>
                    {expense.splits.map((split) => (
                      <span key={split.id} className="chip" style={{ fontSize: '0.75rem', fontWeight: 600, background: split.user_id === user.id && !split.is_settled ? 'var(--error-bg)' : split.is_settled ? 'var(--success-bg)' : 'var(--surface-1)', color: split.user_id === user.id && !split.is_settled ? 'var(--error)' : split.is_settled ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {split.user?.name}: ₹{parseFloat(split.amount).toFixed(2)} {split.is_settled ? '✓' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'balances' && (
          <div className="space-y-4 max-w-2xl">
            {(balances.balances || []).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><TrendingUp size={28} style={{ color: 'var(--success)' }} /></div>
                <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>All settled up! 🎉</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>No pending balances in this group.</p>
              </div>
            ) : (balances.balances || []).map((b, i) => {
              const fromM = members.find((m) => m.user_id === b.from);
              const toM = members.find((m) => m.user_id === b.to);
              return (
                <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s`, background: 'white', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '1rem', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style={{ background: 'linear-gradient(135deg, var(--tertiary), #fc7c78)' }}>
                    {fromM?.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      <strong style={{ fontWeight: 800 }}>{fromM?.user?.name}</strong> owes <strong style={{ fontWeight: 800 }}>{toM?.user?.name}</strong>
                    </p>
                  </div>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.25rem', color: 'var(--tertiary)' }}>
                    ₹{b.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
            {(balances.balances || []).length > 0 && (
              <button onClick={() => setModals({ ...modals, settleUp: true })} className="btn-primary w-full py-3.5 mt-4 text-sm font-bold shadow-sm">
                Settle Up Balances
              </button>
            )}
          </div>
        )}

        {tab === 'members' && (
          <div className="space-y-3 max-w-3xl">
            <div className="grid sm:grid-cols-2 gap-4">
              {members.map((member, i) => (
                <div key={member.user_id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s`, background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '1rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))' }}>
                    {member.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member.user?.name} {member.user_id === user.id && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(You)</span>}
                    </p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{member.user?.email}</p>
                    <div className="mt-2">
                      <span className="chip" style={{ fontSize: '0.7rem', fontWeight: 700, background: member.role === 'admin' ? 'var(--warning-bg)' : 'var(--surface-2)', color: member.role === 'admin' ? 'var(--warning)' : 'var(--text-secondary)' }}>{member.role === 'admin' ? '👑 Admin' : '👤 Member'}</span>
                    </div>
                  </div>
                  {isAdmin && member.user_id !== user.id && (
                    <button onClick={() => handleRemoveMember(member.user_id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 size={16} style={{ color: 'var(--tertiary)' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4 border-t border-gray-100">
              <button onClick={handleLeave}
                className="btn-secondary text-sm font-bold py-3 px-6 text-center w-full sm:w-auto"
                style={{ color: 'var(--tertiary)', border: '1px solid var(--tertiary)' }}>
                Leave Group
              </button>
              {isAdmin && (
                <button onClick={handleDeleteGroup}
                  className="btn-primary bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 px-6 text-center w-full sm:w-auto sm:ml-auto shadow-sm">
                  Delete Group
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modals.addExpense && (
        <AddExpenseModal
          groupId={groupId} members={members} categories={categories}
          onClose={() => setModals({ ...modals, addExpense: false })}
          onAdded={(e) => { setExpenses((prev) => [e, ...prev]); setModals({ ...modals, addExpense: false }); }}
        />
      )}
      {modals.invite && (
        <InviteModal groupId={groupId} onClose={() => setModals({ ...modals, invite: false })} />
      )}
      {modals.settleUp && (
        <SettleUpModal
          groupId={groupId} balances={balances.balances || []} members={members}
          onClose={() => setModals({ ...modals, settleUp: false })}
          onSettled={() => { setModals({ ...modals, settleUp: false }); fetchAll(); }}
        />
      )}
    </div>
  );
}
