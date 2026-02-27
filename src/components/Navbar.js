import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'رفع بلاغ' },
    { to: '/track', label: 'تتبع بلاغي' },
    { to: '/dashboard', label: 'لوحة التحكم' },
  ];

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logoLink}>
        <div style={styles.logoBox}>A</div>
        <div>
          <span style={styles.logoText}>Awla</span>
          <span style={styles.logoSub}>بلاغ ذكي</span>
        </div>
      </Link>
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
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #0a1a0a, #1B4D3E)',
    borderBottom: '1px solid rgba(200,169,81,0.15)',
    direction: 'rtl',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #C8A951, #1B4D3E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#C8A951',
    display: 'block',
    lineHeight: 1,
  },
  logoSub: {
    fontSize: '10px',
    color: '#888',
    display: 'block',
  },
  links: { display: 'flex', gap: '6px' },
  link: {
    color: '#999',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    transition: 'all 0.3s',
  },
  activeLink: {
    background: 'rgba(200,169,81,0.15)',
    color: '#C8A951',
    fontWeight: 'bold',
  },
};

export default Navbar;