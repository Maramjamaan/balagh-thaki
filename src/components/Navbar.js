import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ role }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const citizenLinks = [
    { to: '/', label: 'الرئيسية', icon: '🏠' },
    { to: '/submit', label: 'رفع بلاغ', icon: '📸' },
    { to: '/track', label: 'تتبع البلاغات', icon: '🔍' },
    { to: '/map', label: 'الخريطة', icon: '🗺️' },
  ];

  const govLinks = [
    { to: '/', label: 'الرئيسية', icon: '🏠' },
    { to: '/dashboard', label: 'لوحة التحكم', icon: '📊' },
    { to: '/map', label: 'خريطة البلاغات', icon: '🗺️' },
    { to: '/track', label: 'بحث بلاغ', icon: '🔍' },
  ];

  const links = role === 'government' ? govLinks : citizenLinks;

  return (
    <nav style={{ ...s.nav, background: role === 'government' ? 'linear-gradient(135deg, #1a3a5c 0%, #2d5a8e 100%)' : 'linear-gradient(135deg, #03471f 0%, #1B7F5F 100%)' }}>
      <div style={s.container}>
        <Link to="/" style={s.logoLink}>
          <div style={s.logoMark}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>أ</span>
          </div>
          <div>
            <span style={s.logoText}>أولى</span>
            <span style={s.logoSub}>Awla | نظام البلاغات الذكي</span>
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
    background: 'linear-gradient(135deg, #03471f 0%, #1B7F5F 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 24px rgba(3,71,31,0.15)',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 900,
    color: '#fff',
    display: 'block',
    lineHeight: 1,
    fontFamily: "'Tajawal', sans-serif",
  },
  logoSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    display: 'block',
    marginTop: 2,
    fontFamily: "'Tajawal', sans-serif",
  },
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s',
    fontFamily: "'Tajawal', sans-serif",
  },
  navLinkActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontWeight: 700,
    backdropFilter: 'blur(8px)',
  },
  mobileBtn: {
    display: 'none',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    fontSize: 20,
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: "'Tajawal', sans-serif",
  },
  mobileMenu: {
    padding: '8px 20px 16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: 15,
    marginBottom: 4,
    fontFamily: "'Tajawal', sans-serif",
  },
  mobileLinkActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontWeight: 700,
  },
};

export default Navbar;
