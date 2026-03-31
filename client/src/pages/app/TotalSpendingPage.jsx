import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, ComposedChart, Area } from 'recharts';
import { Wallet, Users, Landmark, TrendingUp, ArrowRight } from 'lucide-react';

const SummaryCard = ({ icon: Icon, title, amount, color, subtext, delay }) => (
  <div className="animate-fadeInUp" style={{ 
    animationDelay: delay,
    background: 'white', 
    borderRadius: 24, 
    padding: '2rem', 
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
      <Icon size={24} />
    </div>
    <div>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</p>
      <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', margin: '4px 0' }}>
        ₹{Number(amount).toLocaleString('en-IN')}
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtext}</p>
    </div>
  </div>
);

export default function TotalSpendingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getGlobal()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-page animate-fadeInUp">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 24 }} />)}
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: 24 }} />
      </div>
    );
  }

  const chartData = data?.monthlyData || [];

  return (
    <div className="app-page animate-fadeInUp">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Wealth Insights</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 6 }}>A bird's-eye view of your total expenditure across personal and group budgets.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <SummaryCard 
          icon={Wallet} 
          title="Private Spending" 
          amount={data?.personalExpense} 
          color="#5d4037" 
          subtext="Total from My Money module"
          delay="0s"
        />
        <SummaryCard 
          icon={Users} 
          title="Group Contribution" 
          amount={data?.groupShareExpense} 
          color="#10B981" 
          subtext="Your share in all OweMate groups"
          delay="0.1s"
        />
        <SummaryCard 
          icon={Landmark} 
          title="Total Ecosystem Spend" 
          amount={data?.totalSpending} 
          color="#1a6aff" 
          subtext="Combined financial footprint"
          delay="0.2s"
        />
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '2rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.25rem' }}>Cumulative Budget Trend</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>How your spending is split month-over-month.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#a1887f' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Personal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#10B981' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Groups</span>
            </div>
          </div>
        </div>

        <div style={{ height: 400, width: '100%' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'var(--surface-1)' }}
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="personal" name="Personal" stackId="a" fill="#a1887f" radius={[0, 0, 0, 0]} barSize={40} />
                <Bar dataKey="group" name="Groups" stackId="a" fill="#10B981" radius={[8, 8, 0, 0]} barSize={40} />
                <Area type="monotone" dataKey="total" name="Total Spend" stroke="#1a6aff" fillOpacity={0.1} fill="#1a6aff" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Insufficient data to generate spending trends.
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
             <TrendingUp color="var(--primary)" size={28} />
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Spending insight</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Your {data?.personalExpense > data?.groupShareExpense ? 'Personal' : 'Group'} spending accounts for {Math.round((Math.max(data?.personalExpense, data?.groupShareExpense) / data?.totalSpending) * 100)}% of your total budget this month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
