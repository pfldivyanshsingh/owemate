import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Zap, Users, PieChart } from 'lucide-react';

/* Floating background orb */
const Orb = ({ style }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%',
    filter: 'blur(60px)', pointerEvents: 'none',
    ...style
  }} />
);

/* Animated feature row shown on the left panel */
const features = [
  { icon: '⚡', label: 'Real-time balance updates' },
  { icon: '🔒', label: 'Secure JWT authentication' },
  { icon: '📊', label: 'Smart spending analytics' },
  { icon: '👥', label: 'Group expense splitting' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f2f7f4', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: '0 0 46%', display: 'none', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #00392a 0%, #005538 40%, #00704c 75%, #10B981 100%)',
      }} className="lg-flex">
        {/* Orbs */}
        <Orb style={{ width: 280, height: 280, top: -80, right: -60, background: 'rgba(16,185,129,0.25)' }} />
        <Orb style={{ width: 200, height: 200, bottom: 80, left: -60, background: 'rgba(0,57,42,0.5)' }} />
        <Orb style={{ width: 150, height: 150, top: '45%', right: '15%', background: 'rgba(16,185,129,0.15)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <img src="/logo.png" alt="OweMate" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.3rem', color: 'white' }}>OweMate</span>
        </div>

        {/* Center copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Welcome back
          </p>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'white', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '2rem' }}>
            Your finances,<br />perfectly balanced.
          </h2>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {features.map(({ icon, label }, i) => (
              <div key={label} className="animate-fadeInLeft" style={{ animationDelay: `${0.1 + i * 0.08}s`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{icon}</div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '0.75rem' }}>
            "OweMate saved our Europe trip — no more arguments over who paid for dinner!"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✈️</div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '0.8125rem' }}>Alex Rivera</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>Digital Nomad</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        {/* subtle bg orbs */}
        <Orb style={{ width: 320, height: 320, top: -80, right: -80, background: 'rgba(16,185,129,0.06)' }} />
        <Orb style={{ width: 240, height: 240, bottom: -60, left: -60, background: 'rgba(0,112,76,0.05)' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Mobile logo */}
          <div className="animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <img src="/logo.png" alt="OweMate" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.2rem', color: '#005538' }}>OweMate</span>
          </div>

          {/* Heading */}
          <div className="animate-fadeInUp" style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.875rem', color: '#0f1c15', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Welcome back 👋
            </h1>
            <p style={{ color: '#718f7e', fontSize: '0.9375rem' }}>
              New here?{' '}
              <Link to="/signup" style={{ color: '#00704c', fontWeight: 700, borderBottom: '1.5px solid rgba(0,112,76,0.3)', paddingBottom: '1px', transition: 'border-color 0.2s' }}>
                Create an account
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="animate-fadeInUp delay-100" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3d5246', marginBottom: '0.5rem' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  className="input-field"
                  style={{ paddingLeft: '1.125rem', paddingRight: '1.125rem', paddingTop: '0.875rem', paddingBottom: '0.875rem', fontSize: '0.9375rem' }}
                  required
                />
              </div>
            </div>

            <div className="animate-fadeInUp delay-150" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3d5246' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: '#00704c', fontWeight: 600, transition: 'opacity 0.15s' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  className="input-field"
                  style={{ paddingLeft: '1.125rem', paddingRight: '3rem', paddingTop: '0.875rem', paddingBottom: '0.875rem', fontSize: '0.9375rem' }}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#718f7e',
                  display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px',
                  transition: 'color 0.15s',
                }}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="animate-fadeInUp delay-200">
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.9375rem', fontSize: '1rem', letterSpacing: '0.01em', position: 'relative', overflow: 'hidden' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span className="animate-spin" style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} />
                    Signing you in…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    Log in <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="animate-fadeIn delay-300" style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: 1, background: '#d8e5dd' }} />
            <span style={{ fontSize: '0.8125rem', color: '#718f7e', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#d8e5dd' }} />
          </div>

          {/* Trust strip */}
          <div className="animate-fadeIn delay-400" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[{ n: '50K+', l: 'Users' }, { n: '₹10M+', l: 'Settled' }, { n: '200K+', l: 'Expenses' }].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.1rem', color: '#005538' }}>{n}</p>
                <p style={{ fontSize: '0.75rem', color: '#718f7e', fontWeight: 500 }}>{l}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
