import { useEffect, useState } from 'react';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeIcon = {
  group_invite: '👥',
  expense_added: '💸',
  payment_received: '✅',
  invite_accepted: '🎉',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll()
      .then((res) => setNotifications(res.data.notifications || []))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All marked as read');
  };

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="app-page animate-fadeInUp max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-heading">
            Notifications {unread > 0 && <span className="text-sm font-semibold ml-2 chip" style={{ background: 'var(--primary-glow)', color: 'var(--primary-dark)' }}>{unread} new</span>}
          </h1>
          <p className="page-subheading">Stay up to date with your expense activity</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary-light)', borderTopColor: 'transparent' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state animate-fadeInUp delay-200">
          <div className="empty-icon"><Bell size={28} style={{ color: 'var(--text-muted)' }} /></div>
          <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', mb: 4 }}>
            All caught up!
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className="row-hover animate-fadeInUp"
              style={{ padding: '1.25rem', animationDelay: `${0.1 + i * 0.05}s`, cursor: 'pointer', border: '1px solid var(--border-subtle)', background: n.is_read ? 'white' : 'var(--surface-1)', borderRadius: 16 }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'var(--surface-2)' }}>
                  {typeIcon[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p style={{ fontSize: '0.9375rem', fontWeight: n.is_read ? 500 : 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.message}</p>
                  <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-3" style={{ background: 'var(--primary)' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
