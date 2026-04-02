import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { analyticsAPI, groupAPI, expenseAPI, personalAPI } from '../../services/api';
import { Users, TrendingUp, TrendingDown, ArrowRight, Receipt, Plus, Wallet, Landmark } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

/* ── Animated stat card ── */
const StatCard = ({ icon: Icon, label, amount, color, bg, gradient, delay, prefix = '₹' }) => (
  <div className="animate-fadeInUp" style={{
    animationDelay: delay,
    background: 'white', borderRadius: 20, padding: '1.5rem',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 2px 8px rgba(15,28,21,0.05)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    cursor: 'default',
  }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,28,21,0.12)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,28,21,0.05)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
    <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.75rem', color: gradient ? 'transparent' : color, background: gradient || 'none', WebkitBackgroundClip: gradient ? 'text' : 'unset', WebkitTextFillColor: gradient ? 'transparent' : 'unset', letterSpacing: '-0.02em' }}>
      {prefix}{typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount}
    </p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '0.75rem 1rem', boxShadow: '0 8px 24px rgba(15,28,21,0.1)', fontFamily: 'Inter' }}>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'Manrope', fontWeight: 800, color: '#005538', fontSize: '1rem' }}>₹{payload[0].value?.toLocaleString('en-IN')}</p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { socket, joinGroup } = useSocket();

  const fetchDashboardData = () => {
    Promise.all([
      analyticsAPI.getMy(),
      groupAPI.getAll(),
      expenseAPI.getAll(),
      personalAPI.getAnalytics(),
      analyticsAPI.getGlobal()
    ])
      .then(([analyticsRes, groupsRes, expensesRes, personalRes, globalRes]) => {
        const d = analyticsRes.data;
        const p = personalRes.data;
        const gSpend = globalRes.data;
        const currentMonth = new Date().toISOString().substring(0, 7);
        const thisMonthAmount = d.monthlyData?.find(m => m.month === currentMonth)?.amount || 0;

        const fetchedGroups = groupsRes.data?.groups || [];
        const fetchedExpenses = expensesRes.data?.expenses || [];

        setData({
          totalOwed: d.totalOwedToMe || 0,
          totalOwe: d.totalIOwe || 0,
          thisMonthTotal: thisMonthAmount,
          personalBalance: p.netBalance || 0,
          totalEcosystemSpend: gSpend.totalSpending || 0,
          combinedBalance: (d.totalOwedToMe - d.totalIOwe) + (p.netBalance || 0),
          monthlySpend: d.monthlyData || [],
          groups: fetchedGroups,
          recentExpenses: fetchedExpenses.sort((a,b) => new Date(b.date) - new Date(a.date)),
          owedDetails: d.owedDetails || [],
          iOweDetails: d.iOweDetails || [],
        });
        
        if (socket && fetchedGroups.length > 0) {
          fetchedGroups.forEach(g => joinGroup(g.id));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [socket]); // Re-fetch and join groups when socket connects

  useEffect(() => {
    if (!socket) return;

    // Listen for actual server events
    socket.on('expense_added', fetchDashboardData);
    socket.on('expense_updated', fetchDashboardData);
    socket.on('expense_deleted', fetchDashboardData);
    socket.on('payment_settled', fetchDashboardData);
    socket.on('personal_transaction_added', fetchDashboardData);
    socket.on('personal_transaction_updated', fetchDashboardData);
    socket.on('personal_transaction_deleted', fetchDashboardData);

    return () => {
      socket.off('expense_added', fetchDashboardData);
      socket.off('expense_updated', fetchDashboardData);
      socket.off('expense_deleted', fetchDashboardData);
      socket.off('payment_settled', fetchDashboardData);
      socket.off('personal_transaction_added', fetchDashboardData);
      socket.off('personal_transaction_updated', fetchDashboardData);
      socket.off('personal_transaction_deleted', fetchDashboardData);
    };
  }, [socket]);

  const chartData = data?.monthlySpend || [];

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton" style={{ height: 36, width: 280, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, width: 200 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 20 }} />)}
        </div>
        <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="app-page animate-fadeInUp">

      {/* Header */}
      <div className="animate-fadeInUp" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Here's your financial overview
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard icon={TrendingUp} label="You are owed" amount={data?.totalOwed || 0} color="#0a8754" bg="rgba(10,135,84,0.1)" delay="0s" />
        <StatCard icon={TrendingDown} label="You owe" amount={data?.totalOwe || 0} color="#ba1a1a" bg="rgba(186,26,26,0.1)" delay="0.07s" />
        <StatCard icon={Wallet} label="Personal Balance" amount={data?.personalBalance || 0} color="#5d4037" bg="rgba(93,64,55,0.1)" delay="0.14s" />
        <StatCard icon={Landmark} label="Total Spend" amount={data?.totalEcosystemSpend || 0} color="#1a6aff" bg="rgba(26,106,255,0.1)" delay="0.21s" />
      </div>

      {/* Pending Settlements / Breakdown */}
      {(data?.owedDetails?.length > 0 || data?.iOweDetails?.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* People who owe you */}
          {data?.owedDetails?.length > 0 && (
            <div className="animate-fadeInUp delay-200" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(10,135,84,0.1)', color: '#0a8754', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} />
                </div>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>People owe you</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.owedDetails.map((od, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-1)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={od.user?.avatar_url || `https://ui-avatars.com/api/?name=${od.user?.name || 'User'}&background=005538&color=fff`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{od.user?.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From {od.details.length} expense(s)</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: '#0a8754' }}>₹{od.totalAmount.toLocaleString('en-IN')}</p>
                      <Link to={`/groups/${od.details[0]?.groupId}`} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Settle Up</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People you owe */}
          {data?.iOweDetails?.length > 0 && (
            <div className="animate-fadeInUp delay-200" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)', gridColumn: data?.owedDetails?.length === 0 ? '1 / -1' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(186,26,26,0.1)', color: '#ba1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={16} />
                </div>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>You owe people</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.iOweDetails.map((io, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-1)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={io.user?.avatar_url || `https://ui-avatars.com/api/?name=${io.user?.name || 'User'}&background=c0392b&color=fff`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{io.user?.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From {io.details.length} expense(s)</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: '#c0392b' }}>₹{io.totalAmount.toLocaleString('en-IN')}</p>
                      <Link to={`/groups/${io.details[0]?.groupId}`} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Pay Now</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart + Groups grid */}
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_380px] gap-6 mb-6 items-start">

        {/* Spending chart */}
        <div className="animate-fadeInUp delay-300" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 3 }}>Spending trend</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#00704c" strokeWidth={2.5} fill="url(#spend)" dot={{ r: 4, fill: '#00704c', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#00704c' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* My Groups */}
        <div className="animate-fadeInRight delay-300" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)', width: "100%" }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>My groups</h2>
            <Link to="/groups" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {(!data?.groups || data.groups.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Users size={22} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>No groups yet</p>
              <Link to="/groups" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '0.875rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                <Plus size={14} /> Create one
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.groups.slice(0, 5).map((g, i) => (
                <Link key={g.id} to={`/groups/${g.id}`} style={{ textDecoration: 'none' }}>
                  <div className="animate-fadeInUp" style={{
                    animationDelay: `${0.35 + i * 0.06}s`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0.75rem', borderRadius: 14,
                    transition: 'background 0.18s ease, transform 0.18s ease',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.transform = ''; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #005538, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                      {g.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{g.member_count} members</p>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent expenses */}
      {data?.recentExpenses?.length > 0 && (
        <div className="animate-fadeInUp delay-400" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: '0 2px 8px rgba(15,28,21,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Recent expenses</h2>
            <Link to="/expenses" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.recentExpenses.slice(0, 5).map((e, i) => (
              <div key={e.id} className="animate-fadeInUp" style={{
                animationDelay: `${0.45 + i * 0.05}s`,
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '0.875rem 0.5rem', borderBottom: i < data.recentExpenses.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.18s ease', borderRadius: 10,
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {e.category_icon || '🧾'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{e.group?.name || 'Personal'} · {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', flexShrink: 0 }}>
                  ₹{Number(e.amount).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
