import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Shield, Users, FolderOpen, Receipt, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAdmin()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary-light)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="app-page animate-fadeInUp">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: 'var(--primary-glow)' }}>
          <Shield size={24} style={{ color: 'var(--primary-dark)' }} />
        </div>
        <div>
          <h1 className="page-heading">Admin Dashboard</h1>
          <p className="page-subheading">System overview and platform statistics</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'var(--primary)', bg: 'rgba(10,135,84,0.1)' },
          { label: 'Total Groups', value: data?.totalGroups || 0, icon: FolderOpen, color: 'var(--secondary)', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Total Expenses', value: data?.totalExpenses || 0, icon: Receipt, color: 'var(--tertiary)', bg: 'rgba(192,57,43,0.1)' },
          { label: 'Total Transactions', value: data?.totalTransactions || 0, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {value.toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Total Volume */}
      <div className="animate-fadeInUp delay-200 mb-8 p-8 flex items-center justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))', borderRadius: 24, boxShadow: '0 8px 32px rgba(10,135,84,0.2)' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Platform Expense Volume</p>
          <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '3rem', color: 'white', lineHeight: 1 }}>
            ₹{data?.totalAmount?.toLocaleString('en-IN') || '0'}
          </p>
        </div>
      </div>

      {/* User Growth Chart */}
      {data?.usersByMonth?.length > 0 && (
        <div className="animate-fadeInUp delay-300" style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border-subtle)', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            User Growth Trend
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.usersByMonth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 12, boxShadow: '0 8px 24px rgba(15,28,21,0.1)', fontFamily: 'Inter' }}
                cursor={{ fill: 'var(--surface-1)' }}
                formatter={(v) => [v, 'New Users']}
              />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#0a8754" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
