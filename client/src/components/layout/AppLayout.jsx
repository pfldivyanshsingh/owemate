import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../services/api';
import {
  LayoutDashboard, Users, Receipt, BarChart3, Bell, LogOut,
  Menu, X, Shield, ChevronRight, Settings, Wallet, Landmark
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/wealth',    label: 'Wealth Insights', icon: Landmark },
  { path: '/my-money',  label: 'My Money',  icon: Wallet },
  { path: '/groups',    label: 'Groups',    icon: Users },
  { path: '/expenses',  label: 'Expenses',  icon: Receipt },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    notificationAPI.getAll()
      .then((res) => setNotifications(res.data.notifications || []))
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => { logout(); navigate('/'); };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'white', borderRight: '1px solid var(--border-subtle)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} className="sidebar-desktop">

        {/* Logo */}
        <div style={{ padding: '1.5rem 1.5rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => setSidebarOpen(false)}>
            <img src="/logo.png" alt="OweMate" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.2rem', color: '#005538' }}>OweMate</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} style={{ display: 'none' }} className="sidebar-close-btn">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-disabled)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem' }}>Menu</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {navItems.map(({ path, label, icon: Icon }, i) => {
              const active = location.pathname === path || location.pathname.startsWith(path + '/');
              return (
                <Link
                  key={path} to={path} onClick={() => setSidebarOpen(false)}
                  className="animate-fadeInLeft"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0.7rem 0.875rem', borderRadius: 12,
                    fontSize: '0.9rem', fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    ...(active ? {
                      background: 'linear-gradient(135deg, #005538, #10B981)',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(0, 112, 76, 0.3)',
                    } : {
                      color: 'var(--text-secondary)',
                    }),
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.paddingLeft = '1.125rem'; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.paddingLeft = '0.875rem'; } }}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {active && <ChevronRight size={14} style={{ opacity: 0.7 }} />}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setSidebarOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.7rem 0.875rem', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)', textDecoration: 'none', transition: 'all 0.2s ease', marginTop: '0.5rem' }}
              >
                <Shield size={18} /> Admin Panel
              </Link>
            )}
          </div>
        </nav>

        {/* User footer */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Link to="/profile" onClick={() => setSidebarOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem',
            borderRadius: 12, textDecoration: 'none', marginBottom: '0.25rem',
            transition: 'background 0.18s ease',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = ''}
          >
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #005538, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <Settings size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '0.6rem 0.75rem',
            borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 600, color: 'var(--tertiary)',
            transition: 'background 0.18s ease',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = ''}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(15,28,21,0.35)', backdropFilter: 'blur(6px)' }}
        />
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', marginLeft: 256 }} className="main-content">

        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0 1.75rem', height: 64,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: '0 1px 0 var(--border-subtle)',
        }}>
          <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
            <Menu size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {/* Page title from path */}
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {location.pathname.split('/')[1] || 'Dashboard'}
            </p>
          </div>

          {/* Notif bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{
              position: 'relative', width: 38, height: 38, borderRadius: 11,
              background: notifOpen ? 'var(--surface-2)' : 'transparent',
              border: '1px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.18s ease',
              borderColor: notifOpen ? 'var(--border-subtle)' : 'transparent',
            }}>
              <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
              {unread > 0 && (
                <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </button>

            {notifOpen && (
              <div className="animate-slideDown" style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: 320, background: 'white', borderRadius: 18,
                boxShadow: '0 12px 40px rgba(15,28,21,0.14)', border: '1px solid var(--border-subtle)',
                overflow: 'hidden', zIndex: 50,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Notifications {unread > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>({unread} new)</span>}</p>
                  {unread > 0 && <button onClick={markAllRead} style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <Bell size={22} style={{ margin: '0 auto 0.5rem', opacity: 0.3, display: 'block' }} />
                      All caught up!
                    </div>
                  ) : notifications.slice(0, 8).map((n) => (
                    <div key={n.id} style={{
                      display: 'flex', gap: 12, padding: '0.875rem 1.25rem',
                      background: n.is_read ? 'transparent' : 'rgba(0,112,76,0.04)',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: n.is_read ? 'transparent' : 'var(--primary-light)' }} />
                      <div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.message}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/notifications" onClick={() => setNotifOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--secondary)', borderTop: '1px solid var(--border-subtle)', textDecoration: 'none', transition: 'background 0.15s ease' }}>
                  View all notifications →
                </Link>
              </div>
            )}
          </div>

          {/* Avatar */}
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '0.375rem 0.5rem', borderRadius: 12, transition: 'background 0.18s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = ''}
          >
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #005538, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ display: 'none' }} className="desktop-name">
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
            </div>
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 3rem' }} className="page-main">
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar-desktop { transform: translateX(0) !important; }
          .sidebar-close-btn { display: none !important; }
          .mobile-menu-btn { display: none !important; }
          .desktop-name { display: block !important; }
        }
        @media (max-width: 1023px) {
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 768px) {
          .page-main { padding: 1.25rem !important; }
        }
        .page-main > * { animation: fadeInUp 0.45s cubic-bezier(0.4, 0, 0.2, 1) both; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
