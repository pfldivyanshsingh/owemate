import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const Orb = ({ style }) => (
  <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none', ...style }} />
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f2f7f4', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <Orb style={{ width: 450, height: 450, top: -120, right: -100, background: 'rgba(16,185,129,0.09)' }} />
      <Orb style={{ width: 300, height: 300, bottom: -80, left: -80, background: 'rgba(0,112,76,0.07)' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div className="animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg, #005538, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 900, color: 'white', fontSize: '1rem' }}>O</div>
            <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.2rem', color: '#005538' }}>OweMate</span>
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '2rem', boxShadow: '0 16px 50px rgba(15,28,21,0.10)', border: '1px solid #d8e5dd', padding: '2.5rem', overflow: 'hidden', position: 'relative' }}>

          {!sent ? (
            <>
              {/* Icon */}
              <div className="animate-scaleInBounce" style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,112,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Mail size={26} style={{ color: '#005538' }} />
              </div>

              <div className="animate-fadeInUp" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.625rem', color: '#0f1c15', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                  Forgot your password?
                </h1>
                <p style={{ color: '#718f7e', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                  No worries — we'll email you a reset link to get you back in.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="animate-fadeInUp delay-100" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3d5246', marginBottom: '0.5rem' }}>Email address</label>
                  <input
                    id="forgot-email" type="email" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    style={{ padding: '0.875rem 1.125rem', fontSize: '0.9375rem' }}
                    required
                  />
                </div>

                <div className="animate-fadeInUp delay-200">
                  <button id="forgot-submit" type="submit" disabled={loading} className="btn-primary"
                    style={{ width: '100%', padding: '0.9375rem', fontSize: '1rem' }}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                        <span className="animate-spin" style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} />
                        Sending…
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        Send reset link <ArrowRight size={18} />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="animate-scaleIn" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div className="animate-scaleInBounce" style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #005538, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={32} color="white" />
              </div>
              <h2 className="animate-fadeInUp" style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.5rem', color: '#0f1c15', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                Check your email!
              </h2>
              <p className="animate-fadeInUp delay-100" style={{ color: '#718f7e', lineHeight: 1.7, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                We sent a password reset link to
              </p>
              <p className="animate-fadeInUp delay-150" style={{ fontWeight: 700, color: '#0f1c15', fontSize: '0.9375rem', marginBottom: '2rem' }}>{email}</p>
              <p className="animate-fadeIn delay-300" style={{ fontSize: '0.8125rem', color: '#718f7e' }}>
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} style={{ color: '#00704c', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
                  try again
                </button>
              </p>
            </div>
          )}

          {/* Back to login */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #eef5f0' }}>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#718f7e', transition: 'color 0.15s' }}>
              <ArrowLeft size={15} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
