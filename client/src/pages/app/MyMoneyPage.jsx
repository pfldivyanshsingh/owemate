import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { personalAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Plus, Wallet, TrendingUp, TrendingDown, Clock, Trash2, Edit2, X } from 'lucide-react';

const COLORS = ['#0a8754', '#10B981', '#1a6aff', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

const StatCard = ({ icon: Icon, label, amount, color, bg, delay }) => (
  <div className={`animate-fadeInUp`} style={{ animationDelay: delay, background: 'white', borderRadius: 20, padding: '1.25rem', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)' }}>
    <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        ₹{Number(amount).toLocaleString('en-IN')}
      </p>
    </div>
  </div>
);

export default function MyMoneyPage() {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('overview'); // overview | transactions
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', amount: '', type: 'expense', category_id: '', date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchAll = useCallback(async () => {
    try {
      const [analyticsRes, transactionsRes, categoriesRes] = await Promise.all([
        personalAPI.getAnalytics(),
        personalAPI.getTransactions(),
        personalAPI.getCategories()
      ]);
      setAnalytics(analyticsRes.data);
      setTransactions(transactionsRes.data.transactions || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      toast.error('Failed to load My Money data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => fetchAll();
    socket.on('personal_transaction_added', onUpdate);
    socket.on('personal_transaction_updated', onUpdate);
    socket.on('personal_transaction_deleted', onUpdate);
    return () => {
      socket.off('personal_transaction_added', onUpdate);
      socket.off('personal_transaction_updated', onUpdate);
      socket.off('personal_transaction_deleted', onUpdate);
    };
  }, [socket, fetchAll]);

  const handleOpenModal = (trx = null) => {
    if (trx) {
      setFormData({
        title: trx.title,
        amount: trx.amount,
        type: trx.type,
        category_id: trx.category_id || '',
        date: trx.date,
      });
      setEditingId(trx.id);
    } else {
      setFormData({
        title: '', amount: '', type: 'expense', category_id: '', date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) return toast.error('Please fill required fields');
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || null, // null allowed if uncategorized
      };
      if (editingId) {
        await personalAPI.updateTransaction(editingId, payload);
        toast.success('Transaction updated');
      } else {
        await personalAPI.addTransaction(payload);
        toast.success('Transaction added');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error('Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await personalAPI.deleteTransaction(id);
      toast.success('Transaction deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleAddCategory = async () => {
    const name = window.prompt('Enter new category name:');
    if (!name?.trim()) return;
    try {
      await personalAPI.addCategory({ name: name.trim() });
      toast.success('Category added');
      // refresh categories
      const catRes = await personalAPI.getCategories();
      setCategories(catRes.data.categories || []);
    } catch (err) {
      toast.error('Failed to add category');
    }
  };

  if (loading) {
    return (
      <div className="app-page animate-fadeInUp">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 20 }} />)}
        </div>
        <div className="skeleton" style={{ height: 350, borderRadius: 20 }} />
      </div>
    );
  }

  const chartData = analytics?.monthlySpend || []; // Wait, the backend returns monthlyData
  const categoryChartData = analytics?.categoryData || [];

  return (
    <div className="app-page animate-fadeInUp">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>My Money</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>Track your personal finances independently.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          style={{ 
            borderRadius: 14, 
            background: 'linear-gradient(135deg, #5d4037, #3e2723)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.25rem', 
            fontWeight: 700, 
            fontSize: '0.9rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(62, 39, 35, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(62, 39, 35, 0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(62, 39, 35, 0.25)'; }}
        >
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setActiveTab('overview')} style={{ paddingBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>
          Overview & Analytics
        </button>
        <button onClick={() => setActiveTab('transactions')} style={{ paddingBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'transactions' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'transactions' ? '2px solid var(--primary)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>
          All Transactions
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fadeInUp">
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <StatCard icon={TrendingUp} label="Total Income" amount={analytics?.totalIncome || 0} color="#0a8754" bg="rgba(10,135,84,0.1)" delay="0s" />
            <StatCard icon={TrendingDown} label="Total Expense" amount={analytics?.totalExpense || 0} color="#c0392b" bg="rgba(192,57,43,0.1)" delay="0.07s" />
            <StatCard icon={Wallet} label="Net Balance" amount={analytics?.netBalance || 0} color={(analytics?.netBalance >= 0) ? '#1a6aff' : '#f59e0b'} bg={(analytics?.netBalance >= 0) ? 'rgba(26,106,255,0.1)' : 'rgba(245, 158, 11, 0.1)'} delay="0.14s" />
          </div>

          <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 12, marginBottom: '2.5rem', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              💡 Summary: You spent <span style={{ color: '#ef4444' }}>₹{Number(analytics?.totalExpense || 0).toLocaleString('en-IN')}</span> and saved <span style={{ color: '#0a8754' }}>₹{Number(analytics?.netBalance || 0).toLocaleString('en-IN')}</span>.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Trend */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)' }}>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Income vs Expenses</h2>
              <div style={{ height: 280, width: '100%' }}>
                {analytics?.monthlyData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0a8754" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0a8754" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Area type="monotone" dataKey="income" stroke="#0a8754" strokeWidth={2.5} fill="url(#incomeColor)" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>
                )}
              </div>
            </div>

            {/* Category Pie */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)' }}>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Expense Breakdown</h2>
              <div style={{ height: 280, width: '100%' }}>
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No expenses to break down</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="animate-fadeInUp" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,28,21,0.05)' }}>
          <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-50)' }}>
            <select className="input-field" style={{ width: 'auto', padding: '0.5rem 1rem' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="input-field" style={{ width: 'auto', padding: '0.5rem 1rem' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {transactions.filter(t => (filterType === 'all' || t.type === filterType) && (filterCategory === 'all' || t.category_id === filterCategory)).length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Wallet size={48} style={{ color: 'var(--outline)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>No personal transactions match your filters</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Adjust filters or click 'Add Transaction'.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => (filterType === 'all' || t.type === filterType) && (filterCategory === 'all' || t.category_id === filterCategory))
                    .map((trx) => (
                      <tr key={trx.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(trx.date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{trx.title}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ display: 'inline-flex', padding: '0.25rem 0.6rem', background: 'var(--surface-2)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {trx.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontFamily: 'Manrope', fontWeight: 800, color: trx.type === 'income' ? '#0a8754' : '#c0392b' }}>
                          {trx.type === 'income' ? '+' : '-'}₹{Number(trx.amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => handleOpenModal(trx)} style={{ border: 'none', background: 'transparent', color: 'var(--secondary)', cursor: 'pointer' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(trx.id)} style={{ border: 'none', background: 'transparent', color: 'var(--error-text)', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ padding: '2rem', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {editingId ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {editingId ? 'Update your personal financial record' : 'Keep track of your personal cash flow'}
                </p>
              </div>
              <button className="icon-btn" onClick={() => setModalOpen(false)} style={{ background: 'var(--surface-1)', borderRadius: 12 }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Type</label>
                  <select
                    className="input-field"
                    style={{ height: '46px', borderRadius: 12 }}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="expense">🔻 Expense</option>
                    <option value="income">🟢 Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Date</label>
                  <input
                    type="date"
                    className="input-field"
                    style={{ height: '46px', borderRadius: 12 }}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Title / Description</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ height: '46px', borderRadius: 12 }}
                  placeholder="e.g. Monthly Salary, Starbucks, Rent..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Amount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      style={{ height: '46px', borderRadius: 12, paddingLeft: '2.5rem' }}
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                  </div>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label className="input-label">Category</label>
                    <button type="button" onClick={handleAddCategory} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Plus size={12} /> New
                    </button>
                  </div>
                  <select
                    className="input-field"
                    style={{ height: '46px', borderRadius: 12 }}
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="secondary-btn" onClick={() => setModalOpen(false)} style={{ flex: 1, height: '48px', borderRadius: 14 }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 1, height: '48px', borderRadius: 14 }}>
                  {editingId ? 'Update Record' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
