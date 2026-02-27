import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: '📋 رفع بلاغ' },
    { to: '/track', label: '🔍 تتبع بلاغي' },
    { to: '/dashboard', label: '🗺️ لوحة التحكم' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🚨</span>
        <span style={styles.logoText}>أولى</span>
        <span style={styles.logoSub}>نظام البلاغات الذكي</span>
      </div>
      <div style={styles.links}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              ...styles.link,
              ...(location.pathname === link.to ? styles.activeLink : {}),
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '24px', fontWeight: 'bold', color: 'white' },
  logoSub: { fontSize: '12px', color: '#aed6f1', marginTop: '2px' },
  links: { display: 'flex', gap: '8px' },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  activeLink: {
    background: 'rgba(255,255,255,0.2)',
    fontWeight: 'bold',
  },
};

export default Navbar;
