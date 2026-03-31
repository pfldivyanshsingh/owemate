import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function InvitationPage({ action }) {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Save intention and redirect to login
      localStorage.setItem('owemate_invite_token', token);
      localStorage.setItem('owemate_invite_action', action);
      navigate('/login');
      return;
    }

    groupAPI.respondToInvite(token, action)
      .then((res) => { setStatus('success'); setMessage(res.data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.error || 'Failed to process invitation'); });
  }, [user, authLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="animate-fadeInUp" style={{ background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 24, padding: '3rem 2rem', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 12px 32px rgba(15,28,21,0.06)' }}>
        {status === 'loading' && (
          <><Loader size={40} className="mx-auto mb-5 animate-spin" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Processing invitation...</p></>
        )}
        {status === 'success' && (
          <div className="animate-scaleIn">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              {action === 'accept' ? 'Welcome to the group!' : 'Invitation Declined'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>{message}</p>
            <button onClick={() => navigate('/groups')} className="btn-primary px-8 py-3.5 text-sm font-bold w-full rounded-xl">
              {action === 'accept' ? 'View Group' : 'Go to Groups'}
            </button>
          </div>
        )}
        {status === 'error' && (
          <div className="animate-scaleIn">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
              <XCircle size={40} />
            </div>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>{message}</p>
            <button onClick={() => navigate('/groups')} className="btn-secondary px-8 py-3.5 text-sm font-bold w-full rounded-xl">Back to Groups</button>
          </div>
        )}
      </div>
    </div>
  );
}
