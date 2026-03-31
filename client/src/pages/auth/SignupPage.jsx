import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Check, CheckCircle } from 'lucide-react';

const Orb = ({ style }) => (
  <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', ...style }} />
);

/* Password strength checker */
const getStrength = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#c0392b', '#d97706', '#00704c', '#10B981'];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await authAPI.signup(form);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  /* ── Success screen ── */
  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f2f7f4', position: 'relative', overflow: 'hidden' }}>
        <Orb style={{ width: 400, height: 400, top: -100, right: -100, background: 'rgba(16,185,129,0.1)' }} />
        <Orb style={{ width: 300, height: 300, bottom: -80, left: -80, background: 'rgba(0,112,76,0.08)' }} />
        <div className="animate-scaleInBounce" style={{ background: 'white', borderRadius: '2rem', boxShadow: '0 20px 60px rgba(15,28,21,0.12)', border: '1px solid #d8e5dd', padding: '3rem 2.5rem', maxWidth: 420, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-scaleInBounce delay-100" style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #005538, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem' }}>
            <CheckCircle size={36} color="white" />
          </div>
          <h2 className="animate-fadeInUp delay-200" style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.75rem', color: '#0f1c15', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Check your inbox!
          </h2>
          <p className="animate-fadeInUp delay-300" style={{ color: '#718f7e', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9375rem' }}>
            We sent a verification link to<br />
            <strong style={{ color: '#0f1c15' }}>{form.email}</strong>
          </p>
          <Link to="/login" className="btn-primary animate-fadeInUp delay-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9375rem', fontSize: '1rem', textDecoration: 'none', color: 'white' }}>
            Go to login <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f2f7f4', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left decorative panel ── */}
      <div style={{
        flex: '0 0 46%', display: 'none', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #00392a 0%, #005538 40%, #00704c 80%, #059669 100%)',
      }} className="lg-flex">
        <Orb style={{ width: 300, height: 300, top: -60, right: -80, background: 'rgba(16,185,129,0.22)' }} />
        <Orb style={{ width: 200, height: 200, bottom: 60, left: -60, background: 'rgba(0,57,42,0.4)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <img src="/logo.png" alt="OweMate" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.3rem', color: 'white' }}>OweMate</span>
        </div>

        {/* Center text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Join the community
          </p>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'white', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '2.5rem' }}>
            Free forever.<br />No credit card.
          </h2>

          {/* Stats */}
          {[
            { val: '50K+', label: 'Registered users' },
            { val: '₹10M+', label: 'Total settled' },
            { val: '200K+', label: 'Expenses tracked' },
          ].map(({ val, label }, i) => (
            <div key={label} className="animate-fadeInLeft" style={{ animationDelay: `${0.1 + i * 0.1}s`, display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', minWidth: 80 }}>
                <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.2rem', color: 'white' }}>{val}</p>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom tag */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>Split bills, not friendships 💚</p>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <Orb style={{ width: 280, height: 280, top: -60, right: -60, background: 'rgba(16,185,129,0.07)' }} />
        <Orb style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'rgba(0,112,76,0.05)' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Mobile logo */}
          <div className="animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <img src="/logo.png" alt="OweMate" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.2rem', color: '#005538' }}>OweMate</span>
          </div>

          <div className="animate-fadeInUp" style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: '1.875rem', color: '#0f1c15', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Create your account ✨
            </h1>
            <p style={{ color: '#718f7e', fontSize: '0.9375rem' }}>
              Already have one?{' '}
              <Link to="/login" style={{ color: '#00704c', fontWeight: 700, borderBottom: '1.5px solid rgba(0,112,76,0.3)', paddingBottom: '1px' }}>
                Log in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="animate-fadeInUp delay-100" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3d5246', marginBottom: '0.5rem' }}>Full name</label>
              <input
                id="signup-name" type="text" placeholder="Alex Rivera"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                style={{ padding: '0.875rem 1.125rem', fontSize: '0.9375rem' }}
                required
              />
            </div>

            {/* Email */}
            <div className="animate-fadeInUp delay-150" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3d5246', marginBottom: '0.5rem' }}>Email address</label>
              <input
                id="signup-email" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                style={{ padding: '0.875rem 1.125rem', fontSize: '0.9375rem' }}
                required
              />
            </div>

            {/* Password */}
            <div className="animate-fadeInUp delay-200" style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3d5246', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  style={{ padding: '0.875rem 3rem 0.875rem 1.125rem', fontSize: '0.9375rem' }}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718f7e', display: 'flex', alignItems: 'center' }}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="animate-fadeInUp" style={{ marginTop: '0.625rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '0.375rem' }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: 'background 0.3s ease', background: i <= strength ? strengthColor[strength] : '#d8e5dd' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: strengthColor[strength], fontWeight: 600 }}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="animate-fadeInUp delay-300">
              <button
                id="signup-submit" type="submit" disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.9375rem', fontSize: '1rem' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span className="animate-spin" style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} />
                    Creating account…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    Create account <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="animate-fadeIn delay-400" style={{ textAlign: 'center', fontSize: '0.8125rem', color: '#718f7e', marginTop: '1.5rem' }}>
            By signing up, you agree to our{' '}
            <span style={{ color: '#00704c', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-flex { display: flex !important; } }
      `}</style>
    </div>
  );
}
