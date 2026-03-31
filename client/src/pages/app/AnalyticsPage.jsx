import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Receipt, BarChart3 } from 'lucide-react';

const COLORS = ['#006c49', '#10B981', '#0058be', '#a43a3a', '#f59e0b', '#8b5cf6'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getMy()
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
      <div className="mb-8">
        <h1 className="page-heading">Analytics</h1>
        <p className="page-subheading">Deep dive into your spending habits</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'You are owed', value: `₹${data?.totalOwedToMe?.toLocaleString('en-IN') || '0'}`, icon: TrendingUp, color: 'var(--success)', bg: 'rgba(10,135,84,0.1)' },
          { label: 'You owe', value: `₹${data?.totalIOwe?.toLocaleString('en-IN') || '0'}`, icon: TrendingDown, color: 'var(--tertiary)', bg: 'rgba(192,57,43,0.1)' },
          { label: 'Total Paid', value: `₹${data?.totalPaid?.toLocaleString('en-IN') || '0'}`, icon: Receipt, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Net Balance', value: `₹${data?.netBalance?.toLocaleString('en-IN') || '0'}`, icon: BarChart3, color: data?.netBalance >= 0 ? 'var(--primary)' : 'var(--tertiary)', bg: 'var(--surface-2)' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.625rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Spending Chart */}
      <div className="animate-fadeInUp delay-300" style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border-subtle)', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Monthly Spending Trend
        </h2>
        {data?.monthlyData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 12, boxShadow: '0 8px 24px rgba(15,28,21,0.1)', fontFamily: 'Inter' }}
                itemStyle={{ color: 'var(--primary-dark)', fontWeight: 700 }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
              />
              <Area type="monotone" dataKey="amount" stroke="#00704c" strokeWidth={3} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#00704c' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No spending data yet</div>
        )}
      </div>

      {/* Category Breakdown */}
      {data?.categoryData?.length > 0 && (
        <div className="animate-fadeInUp delay-400" style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border-subtle)', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>
            Spending by Category
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={100}
                  dataKey="amount"
                  nameKey="category"
                  paddingAngle={5}
                  stroke="none"
                >
                  {data.categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 8px 24px rgba(15,28,21,0.1)', fontFamily: 'Inter', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {data.categoryData.map(({ category, amount }, i) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{category}</span>
                  </div>
                  <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
