import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }
    authAPI.verifyEmail(token)
      .then((res) => { setStatus('success'); setMessage(res.data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.error || 'Verification failed'); });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <div className="card p-10 max-w-md w-full text-center shadow-ambient-lg animate-fadeInUp">
        {status === 'loading' && (
          <>
            <Loader size={40} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--primary-light)' }} />
            <p style={{ color: 'var(--on-surface-variant)' }}>Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--primary-light)' }}>
              <CheckCircle size={32} color="white" />
            </div>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.5rem', color: 'var(--on-surface)', marginBottom: '0.75rem' }}>
              Email Verified!
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{message}</p>
            <Link to="/login" className="btn-primary px-8 py-3 text-sm inline-block" style={{ textDecoration: 'none', color: 'white' }}>
              Log in to OweMate
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--error)' }}>
              <XCircle size={32} color="white" />
            </div>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.5rem', color: 'var(--on-surface)', marginBottom: '0.75rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{message}</p>
            <Link to="/signup" className="btn-secondary px-8 py-3 text-sm inline-block" style={{ textDecoration: 'none' }}>
              Back to Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
