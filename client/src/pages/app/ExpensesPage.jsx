import { useEffect, useState } from 'react';
import { expenseAPI, categoryAPI } from '../../services/api';
import { Receipt, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', category: '' });
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.category) params.category = filters.category;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryAPI.getAll().then((r) => setCategories(r.data.categories || []));
    fetchExpenses();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="app-page animate-fadeInUp">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-heading">All Expenses</h1>
          <p className="page-subheading">Track and filter all your historical splits</p>
        </div>
        <div style={{ background: 'var(--primary-glow)', padding: '0.75rem 1.25rem', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Total Spent</span>
          <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.3rem', color: 'var(--primary-dark)' }}>
            ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="animate-fadeInUp delay-100" style={{ background: 'white', borderRadius: 20, padding: '1.25rem', border: '1px solid var(--border-subtle)', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(15,28,21,0.03)' }}>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--on-surface)' }}>From</label>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="input-field px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--on-surface)' }}>To</label>
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="input-field px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--on-surface)' }}>Category</label>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field px-3 py-2 text-sm">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
            <Filter size={14} /> Apply
          </button>
          <button type="button" onClick={() => { setFilters({ from: '', to: '', category: '' }); }} 
            className="btn-secondary px-4 py-2 text-sm">Clear</button>
        </div>
      </form>

      {/* Expenses List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--primary-light)', borderTopColor: 'transparent' }} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state animate-fadeInUp delay-200">
          <div className="empty-icon"><Receipt size={28} style={{ color: 'var(--text-muted)' }} /></div>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>No expenses found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense, i) => (
            <div key={expense.id} className="row-hover animate-fadeInUp" style={{ animationDelay: `${0.15 + i * 0.04}s`, padding: '1.25rem', background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'var(--surface-2)' }}>
                {expense.category?.icon || '💳'}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  {expense.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Paid by <strong style={{ color: 'var(--text-primary)' }}>{expense.paid_by_user?.name}</strong>
                  </span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-medium)' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {format(new Date(expense.date), 'MMM d, yyyy')}
                  </span>
                  {expense.group && (
                    <>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-medium)' }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>{expense.group.name}</span>
                    </>
                  )}
                </div>
              </div>
              <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)', flexShrink: 0 }}>
                ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
