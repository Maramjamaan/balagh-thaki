import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ role }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isGov = role === 'government';

  const citizenLinks = [
    { to: '/', label: 'الرئيسية', icon: '🏠' },
    { to: '/submit', label: 'بلّغ عن حفرية', icon: '📸' },
    { to: '/track', label: 'تتبع البلاغات', icon: '🔍' },
    { to: '/map', label: 'خريطة الحفريات', icon: '🗺️' },
  ];

  const govLinks = [
    { to: '/', label: 'الرئيسية', icon: '🏠' },
    { to: '/dashboard', label: 'لوحة المراقبة', icon: '📊' },
    { to: '/map', label: 'خريطة الحفريات', icon: '🗺️' },
    { to: '/track', label: 'بحث بلاغ', icon: '🔍' },
  ];

  const links = isGov ? govLinks : citizenLinks;

  return (
    <nav style={s.nav}>
      <div style={s.container}>
        <Link to="/" style={s.logoLink}>
          <div style={s.logoMark}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#C5A656' }}>أ</span>
          </div>
          <div>
            <span style={s.logoText}>أولى</span>
            <span style={s.logoSub}>{isGov ? 'Awla | مراقبة الحفريات' : 'Awla | رصد الحفريات المتأخرة'}</span>
          </div>
        </Link>

        <div style={s.desktopMenu}>
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                style={{ ...s.navLink, ...(active ? s.navLinkActive : {}) }}>
                <span style={{ fontSize: 13 }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} style={s.mobileBtn}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {isOpen && (
        <div style={s.mobileMenu}>
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                style={{ ...s.mobileLink, ...(active ? s.mobileLinkActive : {}) }}>
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: {
    background: 'linear-gradient(135deg, #03471f 0%, #065a2b 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 24px rgba(3,71,31,0.15)',
  },
  container: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64,
  },
  logoLink: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoMark: {
    width: 38, height: 38, borderRadius: 10,
    background: 'rgba(197,166,86,0.2)', border: '1px solid rgba(197,166,86,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: 900, color: '#fff', display: 'block', lineHeight: 1, fontFamily: "'Tajawal', sans-serif" },
  logoSub: { fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: 2, fontFamily: "'Tajawal', sans-serif" },
  desktopMenu: { display: 'flex', alignItems: 'center', gap: 3 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
    color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
    transition: 'all 0.25s ease', fontFamily: "'Tajawal', sans-serif",
  },
  navLinkActive: {
    background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700,
  },
  mobileBtn: {
    display: 'none', background: 'rgba(255,255,255,0.08)', border: 'none',
    color: '#fff', fontSize: 20, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
    fontFamily: "'Tajawal', sans-serif",
  },
  mobileMenu: { padding: '8px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', animation: 'fadeUp 0.3s ease' },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10,
    color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 15, marginBottom: 4,
    fontFamily: "'Tajawal', sans-serif", transition: 'all 0.2s',
  },
  mobileLinkActive: { background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700 },
};

export default Navbar;
