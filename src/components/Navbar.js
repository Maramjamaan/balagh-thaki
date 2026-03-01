import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: '/', label: 'الرئيسية', icon: '📍' },
    { to: '/submit', label: 'رفع بلاغ', icon: '📄' },
    { to: '/track', label: 'تتبع البلاغات', icon: '🔍' },
    { to: '/dashboard', label: 'لوحة التحكم', icon: '📊' },
    { to: '/map', label: 'خريطة الحفريات', icon: '🗺️' },
  ];

  return (
    <nav style={s.nav}>
      <div style={s.container}>
        <Link to="/" style={s.logoLink}>
          <div style={s.logoIcon}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>|</span>
          </div>
          <div>
            <span style={s.logoText}>أولى</span>
            <span style={s.logoSub}>نظام البلاغات الذكي</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div style={s.desktopMenu}>
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                style={{
                  ...s.navLink,
                  ...(active ? s.navLinkActive : {}),
                }}>
                <span style={{ fontSize: 14 }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} style={s.mobileBtn}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={s.mobileMenu}>
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                style={{
                  ...s.mobileLink,
                  ...(active ? s.mobileLinkActive : {}),
                }}>
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
    background: '#1B7F5F',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
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
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    display: 'block',
    lineHeight: 1.1,
    fontFamily: "'Tajawal', sans-serif",
  },
  logoSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    display: 'block',
  },
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
    fontFamily: "'Tajawal', sans-serif",
  },
  navLinkActive: {
    background: '#ffc300',
    color: '#fff',
    fontWeight: 700,
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
  },
  mobileMenu: {
    padding: '8px 20px 16px',
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
    background: '#ffc300',
    color: '#fff',
    fontWeight: 700,
  },
};

// Responsive styles
const sheet = document.createElement('style');
sheet.textContent = `
  @media (max-width: 768px) {
    nav > div > div:nth-child(2) { display: none !important; }
    nav > div > button { display: block !important; }
  }
`;
document.head.appendChild(sheet);

export default Navbar;