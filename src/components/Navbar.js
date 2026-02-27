import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'بلاغ جديد', icon: '📸' },
    { to: '/track', label: 'تتبع', icon: '🔍' },
    { to: '/map', label: 'الخريطة', icon: '🗺️' },
    { to: '/dashboard', label: 'التحكم', icon: '📊' },
  ];

  return (
    <>
      {/* الشريط العلوي — الشعار فقط */}
      <nav style={styles.topBar}>
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoBox}>A</div>
          <div>
            <span style={styles.logoText}>Awla</span>
            <span style={styles.logoSub}>بلاغ ذكي</span>
          </div>
        </Link>
        {/* الروابط للشاشات الكبيرة */}
        <div style={styles.desktopLinks}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.desktopLink,
                ...(location.pathname === link.to ? styles.activeDesktop : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* شريط التنقل السفلي للجوال */}
      <nav style={styles.bottomNav}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              ...styles.bottomLink,
              color: location.pathname === link.to ? '#C8A951' : '#666',
            }}
          >
            <span style={{ fontSize: 20 }}>{link.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: location.pathname === link.to ? 'bold' : 'normal'
            }}>
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}

const styles = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
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
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #C8A951, #1B4D3E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoText: {
    fontSize: '18px',
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
  // روابط سطح المكتب — مخفية على الجوال
  desktopLinks: {
    display: 'none',
    gap: '6px',
  },
  desktopLink: {
    color: '#999',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    transition: 'all 0.3s',
  },
  activeDesktop: {
    background: 'rgba(200,169,81,0.15)',
    color: '#C8A951',
    fontWeight: 'bold',
  },
  // شريط التنقل السفلي — للجوال
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0 12px',
    background: 'linear-gradient(135deg, #0a1a0a, #1B4D3E)',
    borderTop: '1px solid rgba(200,169,81,0.15)',
    zIndex: 1000,
  },
  bottomLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textDecoration: 'none',
    padding: '4px 12px',
    transition: 'all 0.3s',
  },
};

// نضيف CSS للشاشات الكبيرة
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (min-width: 768px) {
    nav:last-of-type {
      display: none !important;
    }
  }
  @media (min-width: 768px) {
    nav:first-of-type > div:last-child {
      display: flex !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;
