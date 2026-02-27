import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'بلاغ', icon: '📸' },
    { to: '/track', label: 'تتبع', icon: '🔍' },
    { to: '/map', label: 'خريطة', icon: '🗺️' },
    { to: '/dashboard', label: 'تحكم', icon: '📊' },
  ];

  return (
    <>
      {/* Top Bar */}
      <nav style={s.topBar}>
        <Link to="/" style={s.logoLink}>
          <div style={s.logoIcon}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>أ</span>
          </div>
          <div>
            <span style={s.logoText}>أولى</span>
            <span style={s.logoSub}>Awla — بلاغ ذكي</span>
          </div>
        </Link>
        <div style={s.desktopNav}>
          {links.map(link => (
            <Link key={link.to} to={link.to}
              style={{
                ...s.deskLink,
                ...(location.pathname === link.to ? s.deskActive : {})
              }}>
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Nav - Mobile */}
      <nav style={s.bottomNav}>
        {links.map(link => {
          const active = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to} style={s.bottomLink}>
              <div style={{
                ...s.bottomIcon,
                background: active ? 'var(--gold-light)' : 'transparent',
                transform: active ? 'scale(1.1)' : 'scale(1)',
              }}>
                <span style={{ fontSize: 18 }}>{link.icon}</span>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                color: active ? 'var(--gold)' : 'var(--text-faint)',
                marginTop: 2,
              }}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

const s = {
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px',
    background: 'linear-gradient(180deg, rgba(10,26,10,0.98), rgba(10,26,10,0.85))',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--gold-border)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logoLink: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoIcon: {
    width: 38, height: 38, borderRadius: 12,
    background: 'linear-gradient(135deg, var(--gold), var(--green-deep))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', boxShadow: '0 4px 16px rgba(200,169,81,0.2)',
  },
  logoText: { fontSize: 20, fontWeight: 800, color: 'var(--gold)', display: 'block', lineHeight: 1.1 },
  logoSub: { fontSize: 10, color: 'var(--text-dim)', display: 'block', letterSpacing: 0.5 },
  desktopNav: { display: 'none', gap: 4 },
  deskLink: {
    color: 'var(--text-dim)', textDecoration: 'none',
    padding: '8px 16px', borderRadius: 12, fontSize: 13,
    transition: 'all 0.3s',
  },
  deskActive: {
    background: 'var(--gold-light)', color: 'var(--gold)', fontWeight: 700,
  },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    padding: '6px 0 14px',
    background: 'linear-gradient(180deg, rgba(10,26,10,0.9), rgba(10,26,10,0.98))',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--gold-border)',
    zIndex: 100,
  },
  bottomLink: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textDecoration: 'none', padding: '4px 16px',
    transition: 'all 0.3s',
  },
  bottomIcon: {
    width: 40, height: 32, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s',
  },
};

// Desktop nav visibility
const sheet = document.createElement('style');
sheet.textContent = `
  @media (min-width: 768px) {
    nav:last-of-type { display: none !important; }
  }
  @media (min-width: 768px) {
    nav:first-of-type > div:last-child { display: flex !important; }
  }
`;
document.head.appendChild(sheet);

export default Navbar;
