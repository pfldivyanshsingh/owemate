import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <div className="card p-8 max-w-sm w-full shadow-ambient-lg animate-fadeInUp">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface-container-low)' }}>
          <Lock size={22} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.5rem', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          Create new password
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Choose a strong new password for your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              id="reset-password"
              type={show ? 'text' : 'password'}
              placeholder="New password (min. 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full px-4 py-3 pr-11 text-sm"
              required
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--outline)' }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input
            id="reset-confirm"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field w-full px-4 py-3 text-sm"
            required
          />
          {password && confirm && password !== confirm && (
            <p className="text-xs" style={{ color: 'var(--error)' }}>Passwords do not match</p>
          )}
          <button type="submit" disabled={loading || !token}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
