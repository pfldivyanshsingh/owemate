import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Users, Zap, PieChart, Shield, Check } from 'lucide-react';

/* ── Intersection Observer hook for scroll animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/* ── Animated counter ── */
function Counter({ to, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(id); }
      else setCount(start);
    }, 20);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

/* ── Feature pill ── */
const Pill = ({ icon: Icon, label, color, delay }) => (
  <div className="feature-pill" style={{ '--delay': delay }}>
    <div className="pill-icon" style={{ background: color + '18' }}>
      <Icon size={16} style={{ color }} />
    </div>
    <span>{label}</span>
  </div>
);

export default function LandingPage() {
  const [trailPos, setTrailPos] = useState({ x: 0, y: 0 });
  const [heroRef, heroInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.2);
  const [featRef, featInView] = useInView(0.15);
  const [ctaRef, ctaInView] = useInView(0.2);

  /* Subtle cursor glow effect */
  useEffect(() => {
    const move = (e) => setTrailPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="landing-root">

      {/* ── Cursor glow ── */}
      <div className="cursor-glow" style={{ left: trailPos.x, top: trailPos.y }} />

      {/* ── Navbar ── */}
      <header className="landing-nav">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="OweMate" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <span className="logo-text">OweMate</span>
          </Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/signup" className="nav-cta">Get started <ArrowRight size={15} /></Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section" ref={heroRef}>
        {/* Background mesh blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className={`hero-content ${heroInView ? 'is-visible' : ''}`}>
          {/* Badge */}
          <div className="hero-badge">
            <Zap size={12} />
            <span>50,000+ people trust OweMate</span>
          </div>

          {/* Headline */}
          <h1 className="hero-headline">
            Split bills,<br />
            <span className="gradient-text">not friendships.</span>
          </h1>

          {/* Sub-text — minimal */}
          <p className="hero-sub">Track expenses. Settle dues. Zero awkwardness.</p>

          {/* CTA buttons */}
          <div className="hero-cta">
            <Link to="/signup" className="cta-primary">
              Start free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="cta-ghost">Sign in</Link>
          </div>

          {/* Feature pills */}
          <div className="pill-row">
            <Pill icon={Users} label="Group splits" color="#00704c" delay="0s" />
            <Pill icon={Zap} label="Real-time updates" color="#10B981" delay="0.08s" />
            <Pill icon={PieChart} label="Spending analytics" color="#1a6aff" delay="0.16s" />
            <Pill icon={Shield} label="Secure invites" color="#9b59b6" delay="0.24s" />
          </div>
        </div>

        {/* Floating card stack */}
        <div className={`hero-cards ${heroInView ? 'is-visible' : ''}`}>
          {/* Main card */}
          <div className="floating-card main-card">
            <div className="fc-header">
              <div className="fc-avatar">🌴</div>
              <div>
                <p className="fc-title">Trip to Bali</p>
                <p className="fc-sub">4 members</p>
              </div>
              <span className="fc-badge">Active</span>
            </div>
            <div className="fc-rows">
              <div className="fc-row">
                <span>🍽️ Nusa Dua Dinner</span>
                <span className="amount-pos">+₹3,600</span>
              </div>
              <div className="fc-row">
                <span>✈️ Flight Tickets</span>
                <span className="amount-neg">−₹25,600</span>
              </div>
            </div>
            <div className="fc-summary">
              <span>You owe Sarah</span>
              <strong>₹22,000</strong>
            </div>
          </div>

          {/* Floating settle notification */}
          <div className="floating-card notif-card">
            <div className="notif-dot" />
            <div>
              <p className="notif-title">Sarah settled up! 🎉</p>
              <p className="notif-sub">₹8,000 received</p>
            </div>
          </div>

          {/* Mini balance chip */}
          <div className="floating-card balance-chip">
            <Check size={14} style={{ color: '#0a8754' }} />
            <span>All settled in Flat 5B</span>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="stats-strip" ref={statsRef}>
        {[
          { label: 'Users', to: 10, prefix: '', suffix: '+' },
          { label: 'Expenses tracked', to: 1000, prefix: '', suffix: '+' },
          { label: 'Settled', to: 1000, prefix: '₹', suffix: '+' },
          { label: 'Groups created', to: 10, prefix: '', suffix: '+' },
        ].map(({ label, to, prefix, suffix }) => (
          <div key={label} className="stat-item">
            <p className="stat-val">
              {statsInView ? <Counter to={to} prefix={prefix} suffix={suffix} /> : `${prefix}0${suffix}`}
            </p>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Features grid ── */}
      <section className="features-section" ref={featRef}>
        <div className="features-inner">
          <p className="section-eyebrow">Features</p>
          <h2 className="section-title">Everything in one place</h2>

          <div className={`features-grid ${featInView ? 'is-visible' : ''}`}>
            {[
              { icon: Users, label: 'Group Management', desc: 'Create groups for trips, apartments, or events.', color: '#00704c', bg: 'rgba(0,112,76,0.08)', e: '👥', delay: 0 },
              { icon: Zap, label: 'Live Updates', desc: 'Socket.io powered real-time balance changes.', color: '#10B981', bg: 'rgba(16,185,129,0.1)', e: '⚡', delay: 1 },
              { icon: PieChart, label: 'Split 4 Ways', desc: 'Equal, unequal, percentage or selective splits.', color: '#1a6aff', bg: 'rgba(26,106,255,0.08)', e: '📊', delay: 2 },
              { icon: Shield, label: 'Secure Invites', desc: 'Accept or reject before expenses are shared.', color: '#9b59b6', bg: 'rgba(155,89,182,0.08)', e: '🛡️', delay: 3 },
            ].map(({ label, desc, color, bg, e, delay }) => (
              <div key={label} className="feat-card" style={{ '--feat-delay': `${delay * 0.08}s` }}>
                <div className="feat-icon" style={{ background: bg }}>
                  <span style={{ fontSize: '1.5rem' }}>{e}</span>
                </div>
                <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>{label}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" ref={ctaRef}>
        <div className={`cta-inner ${ctaInView ? 'is-visible' : ''}`}>
          <h2 className="cta-headline">Ready to split smarter?</h2>
          <p className="cta-sub">Free forever. No credit card required.</p>
          <Link to="/signup" className="cta-primary large">
            Create free account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer" style={{ flexDirection: 'column', gap: '0.5rem', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <img src="/logo.png" alt="OweMate" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <span className="logo-text" style={{ color: 'var(--primary)', fontSize: '1rem' }}>OweMate</span>
          <span>·</span>
          <span>Split bills, not friendships</span>
          <span>·</span>
          <span>© 2026</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Built with ❤️ by <a href="https://linkedin.com/in/pfldivyanshsingh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>@pfldivyanshsingh</a>
        </p>
      </footer>

      {/* ── Scoped styles (all landing CSS) ── */}
      <style>{`
        /* Root */
        .landing-root {
          min-height: 100vh;
          background: #f2f7f4;
          overflow-x: hidden;
          position: relative;
        }

        /* Cursor glow */
        .cursor-glow {
          position: fixed;
          width: 480px; height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
          pointer-events: none;
          transform: translate(-50%, -50%);
          z-index: 0;
          transition: left 0.4s ease, top 0.4s ease;
        }

        /* ── Navbar ── */
        .landing-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px) saturate(1.3);
          border-bottom: 1px solid rgba(200,224,210,0.5);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 2rem;
        }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-mark {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #005538, #10B981);
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: 'Manrope', sans-serif;
          font-weight: 900; font-size: 1rem;
        }
        .logo-text { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 1.2rem; color: #005538; }
        .nav-links { display: flex; align-items: center; gap: 0.75rem; }
        .nav-link {
          font-size: 0.9rem; font-weight: 600; color: #3d5246;
          padding: 0.5rem 1rem; border-radius: 999px;
          transition: background 0.2s, color 0.2s;
        }
        .nav-link:hover { background: rgba(0,112,76,0.08); color: #005538; }
        .nav-cta {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #005538, #10B981);
          color: white; font-size: 0.9rem; font-weight: 700;
          padding: 0.6rem 1.25rem; border-radius: 999px;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }
        .nav-cta:hover { transform: translateY(-1.5px); box-shadow: 0 6px 20px rgba(0,112,76,0.3); opacity: 0.95; }

        /* ── Hero ── */
        .hero-section {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          gap: 4rem; padding: 8rem 2rem 5rem;
          max-width: 1100px; margin: 0 auto;
          position: relative;
        }
        /* Mesh blobs */
        .blob {
          position: fixed; border-radius: 50%; filter: blur(80px);
          pointer-events: none; z-index: 0;
        }
        .blob-1 { width:500px;height:500px;top:-120px;right:-100px; background:rgba(16,185,129,0.12); animation: blobFloat 8s ease-in-out infinite; }
        .blob-2 { width:400px;height:400px;bottom:0;left:-100px;   background:rgba(0,112,76,0.1);  animation: blobFloat 10s ease-in-out infinite reverse; }
        .blob-3 { width:300px;height:300px;top:40%;left:40%;        background:rgba(26,106,255,0.06);animation: blobFloat 12s ease-in-out infinite 2s; }
        @keyframes blobFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(20px,-15px) scale(1.04); }
          66%     { transform: translate(-10px,20px) scale(0.96); }
        }

        .hero-content {
          flex: 1; min-width: 0; position: relative; z-index: 1;
          opacity: 0; transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-content.is-visible { opacity: 1; transform: translateY(0); }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(0,112,76,0.1); color: #005538;
          border: 1px solid rgba(0,112,76,0.2);
          font-size: 0.8125rem; font-weight: 700;
          padding: 0.4rem 1rem; border-radius: 999px; margin-bottom: 1.75rem;
          animation: fadeInUp 0.5s 0.2s both;
        }

        .hero-headline {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(2.8rem, 5.5vw, 4.5rem);
          font-weight: 900; line-height: 1.05; letter-spacing: -0.04em;
          color: #0f1c15; margin-bottom: 1.25rem;
          animation: fadeInUp 0.55s 0.3s both;
        }
        .gradient-text {
          background: linear-gradient(135deg, #005538 0%, #10B981 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .hero-sub {
          font-size: clamp(1rem, 1.8vw, 1.15rem);
          color: #718f7e; line-height: 1.6; margin-bottom: 2rem;
          animation: fadeInUp 0.55s 0.4s both;
        }

        .hero-cta {
          display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
          margin-bottom: 2.5rem;
          animation: fadeInUp 0.55s 0.5s both;
        }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #005538, #10B981);
          color: white; font-family: 'Inter', sans-serif; font-weight: 700;
          font-size: 1rem; padding: 0.875rem 2rem; border-radius: 999px;
          transition: transform 0.22s, box-shadow 0.22s, opacity 0.2s;
          box-shadow: 0 4px 16px rgba(0,112,76,0.25);
        }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,112,76,0.35); opacity: 0.96; }
        .cta-primary.large { font-size: 1.1rem; padding: 1rem 2.25rem; }
        .cta-ghost {
          font-size: 0.9375rem; font-weight: 600; color: #3d5246;
          padding: 0.875rem 1.5rem; border-radius: 999px;
          border: 1.5px solid rgba(0,112,76,0.2);
          transition: background 0.2s, border-color 0.2s;
        }
        .cta-ghost:hover { background: rgba(0,112,76,0.06); border-color: rgba(0,112,76,0.35); }

        /* Pills */
        .pill-row {
          display: flex; flex-wrap: wrap; gap: 0.625rem;
          animation: fadeInUp 0.55s 0.6s both;
        }
        .feature-pill {
          display: flex; align-items: center; gap: 7px;
          background: white; border: 1px solid rgba(200,220,210,0.8);
          border-radius: 999px; padding: 0.4rem 0.9rem;
          font-size: 0.8125rem; font-weight: 600; color: #3d5246;
          box-shadow: 0 1px 4px rgba(15,28,21,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: fadeInUp 0.4s calc(0.65s + var(--delay)) both;
        }
        .feature-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(15,28,21,0.1); }
        .pill-icon { width: 24px; height: 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }

        /* ── Floating cards ── */
        .hero-cards {
          flex: 0 0 360px; position: relative; height: 440px; z-index: 1;
          opacity: 0; transform: translateX(32px) translateY(16px);
          transition: opacity 0.75s 0.2s cubic-bezier(0.4,0,0.2,1), transform 0.75s 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-cards.is-visible { opacity: 1; transform: translateX(0) translateY(0); }

        .floating-card {
          background: white; border-radius: 20px;
          border: 1px solid rgba(200,224,210,0.7);
          box-shadow: 0 8px 32px rgba(15,28,21,0.1);
          padding: 1.25rem 1.5rem;
          position: absolute;
        }

        .main-card {
          width: 320px; top: 0; left: 0;
          animation: floatCard 5s ease-in-out infinite;
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .fc-header { display: flex; align-items: center; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid #eef4f0; margin-bottom: 12px; }
        .fc-avatar { width: 42px; height: 42px; border-radius: 14px; background: #edf7f2; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
        .fc-title { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 0.9375rem; color: #0f1c15; }
        .fc-sub   { font-size: 0.8rem; color: #718f7e; margin-top: 2px; }
        .fc-badge { margin-left: auto; background: #d1f5e4; color: #0a8754; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
        .fc-rows { display: flex; flex-direction: column; gap: 10px; }
        .fc-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: #3d5246; }
        .amount-pos { font-family: 'Manrope', sans-serif; font-weight: 800; color: #0a8754; }
        .amount-neg { font-family: 'Manrope', sans-serif; font-weight: 800; color: #c0392b; }
        .fc-summary { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding: 10px 14px; background: #fde8e6; border-radius: 12px; font-size: 0.875rem; color: #3d5246; }
        .fc-summary strong { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 1.05rem; color: #c0392b; }

        /* Notification card */
        .notif-card {
          width: 230px; bottom: 100px; right: -20px; padding: 1rem 1.25rem;
          display: flex; align-items: center; gap: 12px;
          animation: floatCard 4s ease-in-out infinite 0.8s;
        }
        .notif-dot { width: 10px; height: 10px; background: #0a8754; border-radius: 50%; flex-shrink: 0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(10,135,84,0.4)} 50%{box-shadow:0 0 0 6px transparent} }
        .notif-title { font-size: 0.875rem; font-weight: 700; color: #0f1c15; }
        .notif-sub   { font-size: 0.8rem; color: #718f7e; margin-top: 2px; }

        /* Balance chip */
        .balance-chip {
          width: 210px; bottom: 20px; left: 40px; padding: 0.75rem 1.25rem;
          display: flex; align-items: center; gap: 10px;
          font-size: 0.875rem; font-weight: 600; color: #0a8754;
          animation: floatCard 6s ease-in-out infinite 1.5s;
        }

        /* ── Stats strip ── */
        .stats-strip {
          background: white; border-top: 1px solid rgba(200,224,210,0.6); border-bottom: 1px solid rgba(200,224,210,0.6);
          display: flex; justify-content: center; flex-wrap: wrap; gap: 0;
        }
        .stat-item {
          padding: 2rem 3rem; text-align: center;
          border-right: 1px solid rgba(200,224,210,0.5);
          flex: 1; min-width: 140px;
          transition: background 0.2s;
        }
        .stat-item:last-child { border-right: none; }
        .stat-item:hover { background: #f7fbf8; }
        .stat-val   { font-family: 'Manrope', sans-serif; font-size: 1.875rem; font-weight: 900; color: #005538; display: block; }
        .stat-label { font-size: 0.8125rem; font-weight: 600; color: #718f7e; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }

        /* ── Features ── */
        .features-section { padding: 6rem 2rem; background: #f2f7f4; }
        .features-inner { max-width: 1000px; margin: 0 auto; }
        .section-eyebrow { font-size: 0.8rem; font-weight: 700; color: #00704c; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; display: block; text-align: center; }
        .section-title { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: clamp(1.75rem, 3vw, 2.25rem); color: #0f1c15; text-align: center; margin-bottom: 3rem; letter-spacing: -0.03em; }

        .features-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;
        }
        @media (min-width: 768px) {
          .features-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .feat-card {
          background: white; border-radius: 20px; padding: 1.75rem 1.5rem;
          border: 1px solid rgba(200,220,210,0.7);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s calc(var(--feat-delay)) cubic-bezier(0.4,0,0.2,1),
                      transform 0.5s calc(var(--feat-delay)) cubic-bezier(0.4,0,0.2,1),
                      box-shadow 0.25s ease, border-color 0.25s ease;
          cursor: default;
        }
        .features-grid.is-visible .feat-card { opacity: 1; transform: translateY(0); }
        .feat-card:hover { box-shadow: 0 8px 28px rgba(15,28,21,0.1); border-color: rgba(0,112,76,0.2); transform: translateY(-3px); }

        .feat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }

        /* ── CTA ── */
        .cta-section {
          padding: 7rem 2rem; text-align: center;
          background: linear-gradient(135deg, #005538 0%, #00704c 50%, #10B981 100%);
          position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.08) 0%, transparent 70%);
        }
        .cta-inner {
          position: relative; max-width: 520px; margin: 0 auto;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s, transform 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        .cta-inner.is-visible { opacity: 1; transform: translateY(0); }
        .cta-headline { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: clamp(1.75rem, 3.5vw, 2.5rem); color: white; margin-bottom: 0.75rem; letter-spacing: -0.03em; }
        .cta-sub { font-size: 1rem; color: rgba(255,255,255,0.72); margin-bottom: 2.5rem; }
        .cta-section .cta-primary { background: white; color: #005538; box-shadow: 0 6px 24px rgba(0,0,0,0.18); }
        .cta-section .cta-primary:hover { background: #f0faf7; box-shadow: 0 10px 32px rgba(0,0,0,0.25); }

        /* ── Footer ── */
        .landing-footer {
          display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap;
          padding: 1.75rem 2rem; font-size: 0.875rem; color: #718f7e;
          border-top: 1px solid rgba(200,224,210,0.5);
          background: white;
        }

        /* ── Breakpoints ── */
        @media (max-width: 900px) {
          .hero-section { flex-direction: column; text-align: center; padding-top: 7rem; }
          .pill-row { justify-content: center; }
          .hero-cta { justify-content: center; }
          .hero-cards { width: 100%; max-width: 340px; height: 400px; flex: none; }
          .main-card { left: 50%; transform: translateX(-50%); }
          .notif-card { right: 0; }
          .balance-chip { left: 10px; }
        }

        @media (max-width: 600px) {
          .hero-headline { font-size: 2.5rem; }
          .hero-cards { display: none; }
          .stat-item { padding: 1.5rem 1.5rem; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── Keyframes (reuse) ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
